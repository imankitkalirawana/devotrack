'use client';
import { sectionItemsWithTeams } from '@/components/dashboard/sidebar/sidebar-items';
import {
  cn,
  Spacer,
  ScrollShadow,
  Button,
  Breadcrumbs as NextUIBreadcrumbs,
  BreadcrumbItem
} from '@heroui/react';
import { Icon } from '@iconify/react';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar/sidebar';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../ui/logo';
import { useRouter } from 'nextjs-toploader/app';

export default function DashboardLayout({
  session,
  children
}: {
  session: any;
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const isHidden = localStorage.getItem('isHidden');
    setIsHidden(isHidden === 'true');
  }, []);

  const pathname = usePathname();
  let currentPath = pathname.split('/')?.[2];

  const pathSegments = pathname?.split('/').filter((segment) => segment !== '');

  const breadcrumbItems = pathSegments?.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return { label: segment, link: path };
  });

  const sidebar = useMemo(() => {
    return (
      <div
        className={cn(
          'relative flex h-full w-72 max-w-[288px] flex-1 flex-col !border-r-small border-divider transition-[transform,opacity,margin] duration-250 ease-in-out',
          {
            '-ml-72 -translate-x-72': isHidden
          }
        )}
      >
        <div className="px-4 py-2">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        <ScrollShadow className="h-full max-h-full pl-2">
          <Sidebar
            defaultSelectedKey="home"
            items={sectionItemsWithTeams}
            selectedKeys={[currentPath || 'dashboard']}
          />
        </ScrollShadow>
        <Spacer y={8} />
        <div className="flex flex-col px-2 pb-4">
          <Button
            aria-label="Help & Information"
            fullWidth
            className="justify-start text-default-500 data-[hover=true]:text-foreground"
            startContent={
              <Icon
                className="text-default-500"
                icon="solar:question-circle-bold-duotone"
                width={24}
              />
            }
            variant="light"
            as={Link}
            href="/dashboard"
          >
            Help & Information
          </Button>
          <Button
            aria-label="Log Out"
            className="justify-start text-default-500 data-[hover=true]:text-danger"
            startContent={
              <Icon
                className="rotate-180"
                icon="solar:logout-bold-duotone"
                width={24}
              />
            }
            variant="light"
            color="danger"
            onPress={async () => {
              await signOut();
              router.push('/auth/login');
            }}
          >
            Log Out
          </Button>
        </div>
      </div>
    );
  }, [isHidden, currentPath]);

  const header = useMemo(() => {
    return (
      <header className="flex items-center gap-3 rounded-medium border-small border-divider p-4">
        <Button
          aria-label="Toggle Sidebar"
          isIconOnly
          size="sm"
          variant="light"
          onPress={() =>
            setIsHidden((prev) => {
              localStorage.setItem('isHidden', !prev ? 'true' : 'false');
              return !prev;
            })
          }
        >
          <Icon
            className="text-default-500"
            height={24}
            icon="solar:sidebar-minimalistic-outline"
            width={24}
          />
        </Button>
        <NextUIBreadcrumbs variant="light">
          {breadcrumbItems?.map((item, index) => (
            <BreadcrumbItem key={index}>
              {index !== breadcrumbItems.length - 1 ? (
                <Link href={item.link} className="capitalize">
                  {item.label}
                </Link>
              ) : (
                <span className="capitalize">{item.label}</span>
              )}
            </BreadcrumbItem>
          ))}
        </NextUIBreadcrumbs>
      </header>
    );
  }, [breadcrumbItems, isHidden]);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      {sidebar}
      <div className="w-[80vw] flex-1 flex-col md:p-4">
        {header}
        <main className="mt-4 h-full w-full overflow-visible">
          <div className="flex h-[85vh] flex-col gap-4 overflow-scroll rounded-medium border-small border-divider p-2 pb-12 pt-4 md:p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
