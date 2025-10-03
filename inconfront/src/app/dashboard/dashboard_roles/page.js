"use client";
import Dashroles from "../components/dashboardrol";
import { useSearchParams } from 'next/navigation';
import Hidebyrol from "../components/hiddenroles";

export default function Rolesdashboard() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');



    return (
        <>
            <Dashroles projectId={projectId} Hidebyrol={Hidebyrol}/>
        </>
    );
}
