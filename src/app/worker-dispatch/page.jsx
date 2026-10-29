import React from 'react';
import WorkerClaimDashboard from '../../components/worker/WorkerClaimDashboard';

export const metadata = {
  title: 'Worker Real-Time Dispatch Radar | PlumberIndore',
  description: 'First-to-Claim automated doorstep dispatch portal for certified technicians and service providers in Indore.',
  robots: {
    index: false,
    follow: false
  }
};

export default function WorkerDispatchPage() {
  return <WorkerClaimDashboard />;
}
