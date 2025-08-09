import { use } from 'react';
import EditAccountClient from './client';

export default function EditAccountPage({ params }: { params: { id: string } }) {
  // Unwrap the params.id Promise in the server component
  const id = use(params.id);
  
  // Pass the unwrapped id to the client component
  return <EditAccountClient id={id} />;
}
