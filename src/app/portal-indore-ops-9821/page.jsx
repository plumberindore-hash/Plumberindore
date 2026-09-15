import OpsPortalClient from '../../components/portal/OpsPortalClient';

export const metadata = {
  title: 'PlumberIndore Ops Portal | Operations Control Center',
  description: 'Confidential operations dispatch console for PlumberIndore.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
};

export default function PortalPage() {
  return <OpsPortalClient />;
}
