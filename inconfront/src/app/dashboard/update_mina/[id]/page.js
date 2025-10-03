'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import UpdateMinaPage from '@/app/dashboard/components/update_mina';
import { getMinaById } from '@/app/services/minas';
import Loader from '@/app/dashboard/components/loader';
import { getPaises } from "@/app/services/pais";
import { getUsers } from "@/app/services/user";
import getOrganizations from "@/app/services/organizacion";

export default function MinaUpdate() {
  const { id } = useParams();
  const [minaData, setMinaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paises, setPaises] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [paisesData, usersData, orgData] = await Promise.all([
          getPaises(),
          getUsers(),
          getOrganizations(),
        ]);

        setPaises(paisesData.data);
        setUsers(usersData.data);
        setOrganizations(orgData.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMinaById(id);
        setMinaData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return <Loader />;
  }

  return <UpdateMinaPage minaData={minaData} paises={paises} users={users} organizations={organizations}/>;
}
