import React from 'react';
import { useSelector } from "react-redux";
import { getPrimaryRole } from "@/app/utils/roleUtils";

const Hidebyrol = ({ hiddenRoles = [], children }) => {
    const userStore = useSelector((state) => state.user);
    const role = getPrimaryRole(userStore.user);

    if (hiddenRoles.includes(role)) {
        return null;
    }

    return <>{children}</>;
};

export default Hidebyrol;