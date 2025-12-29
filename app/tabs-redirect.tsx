import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { getUser } from '../scripts/user';

export default function TabsRedirect() {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      setUserType(user.user_type.toLowerCase());
    }
    fetchUser();
  }, []);

  if (!userType) return null; // or a loading spinner

  // Redirect based on type
  return userType === 'technician' ? <Redirect href="(tech-tabs)/home" /> : <Redirect href="(client-tabs)/home" />;
}
