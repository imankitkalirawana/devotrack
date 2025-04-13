'use client';
import { formatReadableDate } from '@/lib/helper';
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Listbox,
  ListboxItem,
  Skeleton,
  Switch,
  Tab,
  Tabs
} from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useQueryState } from 'nuqs';
import NewJob from './new';
import { useEffect, useMemo, useState } from 'react';

// Helper function to get day names
const getDayNames = (days: number[]) => {
  const dayMap = {
    0: 'S',
    1: 'M',
    2: 'T',
    3: 'W',
    4: 'T',
    5: 'F',
    6: 'S'
  };

  return days.map((day) => dayMap[day as keyof typeof dayMap]);
};

const getTime = (hours: number, minutes: number) => {
  const amPm = hours < 12 ? 'AM' : 'PM';
  const hour = hours % 12 || 12;
  return `${hour}:${minutes.toString().padStart(2, '0')} ${amPm}`;
};

export default function Jobs({ session }: { session: any }) {
  const [modal, setModal] = useQueryState('modal');

  const {
    data: jobs = [],
    refetch,
    isLoading
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetch('/api/v1/lpu/jobs').then((res) => res.json())
  });

  useEffect(() => {
    refetch();
  }, [modal]);

  const sortedJobs = useMemo(() => {
    return jobs.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs]);

  return (
    <>
      <div className="container mx-auto py-10">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {jobs.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-medium">
                  Scheduled Automations ({jobs.length})
                </h1>
                <Button
                  variant="solid"
                  color="primary"
                  startContent={
                    <Icon icon="solar:add-circle-bold-duotone" width={18} />
                  }
                  onPress={() => {
                    setModal('new-job');
                  }}
                >
                  Create new automation
                </Button>
              </div>
            )}
            {sortedJobs.length > 0 ? (
              <div className="grid gap-6">
                {sortedJobs.map((item: any) => (
                  <JobItem
                    key={item._id.toString()}
                    item={item}
                    refetch={refetch}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center gap-2">
                <Icon
                  icon="solar:emoji-funny-square-line-duotone"
                  width={100}
                />
                <p className="text-sm text-default-500">No automations found</p>
                <Button
                  variant="solid"
                  color="primary"
                  onPress={() => setModal('new-job')}
                >
                  Create new automation
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <NewJob session={session} />
    </>
  );
}

function JobItem({ item, refetch }: { item: any; refetch: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isExpired = item.schedule.expiresAt
    ? new Date(formatReadableDate(item.schedule.expiresAt.toString())) <
      new Date()
    : false;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/v1/lpu/jobs`, {
        body: JSON.stringify({ jobId: item.jobId }),
        method: 'DELETE'
      });
      addToast({
        title: 'Automation deleted',
        description: 'The automation has been deleted successfully',
        color: 'success'
      });
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      title={isExpired ? 'Job Expired' : ''}
      className={cn('overflow-hidden', isExpired && 'opacity-50')}
      isDisabled={isExpired || isDeleting}
    >
      <CardHeader className="bg-default-100">
        <div className="flex w-full items-start justify-between">
          <div>
            <h1 className="text-xl">{item.title}</h1>
            <p className="mt-1 flex items-center gap-1">
              <Icon icon="solar:global-line-duotone" width={18} />
              <span className="max-w-[500px] truncate text-sm">{item.url}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Chip
              variant={isExpired ? 'bordered' : 'flat'}
              color={
                isExpired ? 'danger' : item.enabled ? 'success' : 'default'
              }
            >
              {isExpired ? 'Expired' : item.enabled ? 'Active' : 'Inactive'}
            </Chip>
            <Switch isSelected={isExpired ? false : item.enabled} />
            <Dropdown aria-label="Actions" placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <Icon
                    icon="solar:menu-dots-bold"
                    className="rotate-90"
                    width={18}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  onPress={handleDelete}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <Listbox
          aria-label="User Menu"
          className="gap-0 divide-y divide-default-300/50 overflow-visible rounded-medium rounded-t-none bg-content1 p-0 shadow-small"
          itemClasses={{
            base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-background cursor-default'
          }}
        >
          {item.schedule.wdays.length > 0 ? (
            <ListboxItem
              key="schedules"
              startContent={
                <IconWrapper className="bg-success/10 text-success">
                  <Icon icon="solar:calendar-bold-duotone" width={20} />
                </IconWrapper>
              }
              endContent={
                <div className="flex items-center gap-1">
                  {item.schedule.wdays[0] === -1 ? (
                    <p className="flex h-6 items-center justify-center rounded-md bg-default-200 px-2 text-sm shadow-md">
                      Every day
                    </p>
                  ) : (
                    getDayNames(item.schedule.wdays).map((day, index) => (
                      <p
                        key={`day-${index}`}
                        className="flex aspect-square w-6 items-center justify-center rounded-md bg-default-200 text-sm shadow-md"
                      >
                        {day}
                      </p>
                    ))
                  )}
                </div>
              }
            >
              Schedules
            </ListboxItem>
          ) : null}
          <ListboxItem
            key="time"
            // endContent={<ItemCounter number={13} />}
            startContent={
              <IconWrapper className="bg-amber-500/10 text-amber-500">
                <Icon icon="solar:clock-square-bold-duotone" width={20} />
              </IconWrapper>
            }
            endContent={
              <div className="flex items-center gap-1">
                <p className="flex h-6 items-center justify-center rounded-md bg-default-200 px-2 text-sm shadow-md">
                  {getTime(item.schedule.hours, item.schedule.minutes)}
                </p>
              </div>
            }
          >
            Time
          </ListboxItem>
          <ListboxItem
            key="timezone"
            startContent={
              <IconWrapper className="bg-fuchsia-500/10 text-fuchsia-500">
                <Icon icon="solar:earth-bold-duotone" width={20} />
              </IconWrapper>
            }
            endContent={
              <p className="flex h-6 items-center justify-center rounded-md bg-default-200 px-2 text-sm shadow-md">
                {item.schedule.timezone}
              </p>
            }
          >
            Timezone
          </ListboxItem>
          <ListboxItem
            key="expiresAt"
            startContent={
              <IconWrapper className="bg-orange-500/10 text-orange-500">
                <Icon
                  icon="solar:expressionless-square-bold-duotone"
                  width={20}
                />
              </IconWrapper>
            }
            endContent={
              item.schedule.expiresAt ? (
                <p className="flex h-6 items-center justify-center rounded-md bg-default-200 px-2 text-sm shadow-md">
                  {format(
                    new Date(
                      formatReadableDate(item.schedule.expiresAt.toString())
                    ),
                    'PPp'
                  )}
                </p>
              ) : (
                <p className="flex h-6 items-center justify-center rounded-md bg-default-200 px-2 text-sm shadow-md">
                  Never expires
                </p>
              )
            }
          >
            Expires
          </ListboxItem>
          <ListboxItem
            key="email"
            startContent={
              <IconWrapper className="bg-blue-500/10 text-blue-500">
                <Icon icon="solar:bell-bold-duotone" width={20} />
              </IconWrapper>
            }
            endContent={<Switch isSelected={item.email} />}
          >
            Notification Emails
          </ListboxItem>
        </Listbox>
      </CardBody>
    </Card>
  );
}

export const IconWrapper = ({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      className,
      'flex h-7 w-7 items-center justify-center rounded-small'
    )}
  >
    {children}
  </div>
);

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={`loading-${index}`}
          className="w-full overflow-hidden rounded-large border shadow-small"
        >
          {/* Header */}
          <CardHeader className="flex-col items-start gap-2 bg-default-100 p-4 py-3">
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-6 w-64 rounded-small" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-small" />
                <Skeleton className="h-6 w-12 rounded-small" />
                <Skeleton className="h-8 w-8 rounded-small" />
              </div>
            </div>

            {/* URL */}
            <div className="flex w-full items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-small text-default-500" />
              <Skeleton className="h-5 w-full max-w-xl rounded-small" />
            </div>
          </CardHeader>

          {/* Settings List */}
          <div className="space-y-3 p-4">
            {/* Schedules */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="flex h-8 w-8 items-center justify-center rounded-small" />
                <Skeleton className="h-5 w-24 rounded-small" />{' '}
                {/* Schedules */}
              </div>
              <div className="flex gap-1">
                {['M', 'T', 'W', 'T', 'F'].map((_day, index) => (
                  <Skeleton key={index} className="h-8 w-8 rounded-small" />
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="flex h-8 w-8 items-center justify-center rounded-small" />
                <Skeleton className="h-5 w-16 rounded-small" /> {/* Time */}
              </div>
              <Skeleton className="h-8 w-24 rounded-small" /> {/* Time value */}
            </div>

            {/* Timezone */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="flex h-8 w-8 items-center justify-center rounded-small" />
                <Skeleton className="h-5 w-24 rounded-small" /> {/* Timezone */}
              </div>
              <Skeleton className="h-8 w-32 rounded-small" />{' '}
              {/* Timezone value */}
            </div>

            {/* Expires */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="flex h-8 w-8 items-center justify-center rounded-small" />
                <Skeleton className="h-5 w-20 rounded-small" /> {/* Expires */}
              </div>
              <Skeleton className="h-8 w-32 rounded-small" />{' '}
              {/* Expires value */}
            </div>

            {/* Notification Emails */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="flex h-8 w-8 items-center justify-center rounded-small" />
                <Skeleton className="h-5 w-36 rounded-small" />{' '}
                {/* Notification Emails */}
              </div>
              <Skeleton className="h-8 w-12 rounded-small" /> {/* Toggle */}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
