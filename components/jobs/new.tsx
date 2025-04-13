'use client';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Listbox,
  ListboxItem,
  Input,
  Select,
  SelectItem,
  Form,
  ScrollShadow,
  addToast
} from '@heroui/react';
import { useFormik } from 'formik';
import { useQueryState } from 'nuqs';
import { IconWrapper } from '.';
import { Icon } from '@iconify/react/dist/iconify.js';
import axios from 'axios';
import { APP_INFO } from '@/lib/config';

type Schedule = {
  timezone: string;
  expiresAt: number;
  hours: number[];
  minutes: number[];
  wdays: number[];
  mdays: number[];
  months: number[];
};

const automations = [
  {
    label: 'LPU Check-in',
    key: 'lpu-check-in',
    icon: 'solar:login-2-bold-duotone',
    className: 'bg-primary/10 text-primary',
    url: `${APP_INFO.url}/api/v1/lpu/check-in`
  },
  {
    label: 'LPU Check-out',
    key: 'lpu-check-out',
    icon: 'solar:logout-2-bold-duotone',
    className: 'bg-success/10 text-success',
    url: `${APP_INFO.url}/api/v1/lpu/check-out`
  }
];
export default function NewJob({ session }: { session: any }) {
  const [modal, setModal] = useQueryState('modal');

  const formik = useFormik({
    initialValues: {
      title: '',
      automation: 'lpu-check-in',
      url: automations.find((item) => item.key === 'lpu-check-in')?.url,
      schedule: {
        timezone: 'Asia/Kolkata',
        expiresAt: 0,
        hours: [],
        mdays: [],
        minutes: [],
        months: [],
        wdays: []
      },
      body: {
        regNo: '',
        password: ''
      }
    },
    onSubmit: async (values) => {
      try {
        await axios.post('/api/v1/lpu/jobs', values);
        addToast({
          title: 'Automation Created',
          description: 'Automation created successfully',
          color: 'success'
        });
        formik.resetForm();
        setModal(null);
      } catch (error) {
        addToast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Something went wrong',
          color: 'danger'
        });
      }
    }
  });

  // console.log(formik.values.schedule);

  const handleScheduleInput = (input: string) => {
    const schedule = parseScheduleInput(input);
    formik.setFieldValue('schedule', schedule);
  };

  return (
    <Modal
      isOpen={modal === 'new-job'}
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={false}
      onOpenChange={() => {
        formik.resetForm();
        setModal(null);
      }}
    >
      <ModalContent
        as={Form}
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit();
        }}
      >
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create new automation
            </ModalHeader>
            <ModalBody as={ScrollShadow} className="w-full p-4 scrollbar-hide">
              <Select
                items={automations}
                label="Automation"
                isRequired
                disallowEmptySelection
                defaultSelectedKeys={[formik.values.automation]}
                selectedKeys={[formik.values.automation]}
                name="automation"
                onChange={(e) => {
                  formik.setFieldValue('automation', e.target.value);
                  formik.setFieldValue(
                    'url',
                    automations.find((item) => item.key === e.target.value)?.url
                  );
                }}
              >
                {(item) => (
                  <SelectItem
                    key={item.key}
                    startContent={
                      <IconWrapper className={item.className}>
                        <Icon icon={item.icon} width={20} />
                      </IconWrapper>
                    }
                    textValue={item.label}
                  >
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Input
                label="Title"
                name="title"
                placeholder="Enter Title"
                description="Optional"
                value={formik.values.title}
                onChange={formik.handleChange}
              />
              <Input
                name="body.regNo"
                label="Registration Number"
                placeholder="eg: 12345678"
                value={formik.values.body.regNo}
                onChange={formik.handleChange}
                description="Enter LPU Registration Number"
                validate={(value) => {
                  if (value.length !== 8) {
                    return 'Registration Number must be 8 digits';
                  }
                  if (isNaN(Number(value))) {
                    return 'Registration Number must be a number';
                  }
                  return true;
                }}
                isRequired
              />
              <Input
                name="body.password"
                label="Password"
                type="password"
                placeholder="Enter Password"
                value={formik.values.body.password}
                onChange={formik.handleChange}
                description="Your password will be end to end encrypted"
                isRequired
              />
              <Input
                label="Schedule"
                placeholder="eg: Weekdays, 10:00 AM"
                onBlur={(e) => handleScheduleInput(e.target.value)}
                isRequired
              />
            </ModalBody>
            <ModalFooter className="w-full">
              <Button
                fullWidth
                color="danger"
                variant="light"
                onPress={onClose}
                type="reset"
              >
                Close
              </Button>
              <Button
                fullWidth
                type="submit"
                color="primary"
                isLoading={formik.isSubmitting}
              >
                Create Automation
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function parseScheduleInput(input: string): Schedule {
  const schedule: Schedule = {
    timezone: 'Asia/Kolkata',
    expiresAt: 0,
    hours: [],
    minutes: [],
    wdays: [-1],
    mdays: [-1],
    months: [-1]
  };

  const normalizedInput = input.toLowerCase().trim();

  // Match times like "10 am", "10:00 am", "3 PM", etc.
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const timeMatch = normalizedInput.match(timeRegex);

  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3]?.toLowerCase();

    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;

    schedule.hours = [hour];
    schedule.minutes = [minute];
  }

  // Handle day keywords
  if (normalizedInput.includes('weekdays')) {
    schedule.wdays = [1, 2, 3, 4, 5];
  } else if (normalizedInput.includes('weekends')) {
    schedule.wdays = [0, 6];
  } else if (normalizedInput.includes('every day')) {
    schedule.wdays = [-1];
  } else {
    const weekdayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const matchedDays = Object.entries(weekdayMap)
      .filter(([day]) => normalizedInput.includes(day))
      .map(([, index]) => index);

    if (matchedDays.length > 0) {
      schedule.wdays = matchedDays;
    }
  }

  return schedule;
}
