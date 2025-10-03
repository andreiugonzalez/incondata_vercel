'use client';

import '../style/new_password.css';
import React, { useState } from 'react';
import New_password from '../components/new_password';
const { useRouter } = require('next/navigation');

export default function New_passwordaccount({ searchParams }) {
    const router = useRouter();

    /* if (!searchParams.token || !searchParams.flow) {
        router.push('/login');
    } */

    return (
        <div className="bg-account relative">
            <div className="absolute inset-0"></div>
            <div className="bg-logo relative z-10">
                <span className="font-zen-kaku font-color-c font-bold"></span>
                <p className="font-color-p relative z-10"></p>
                <div className=" min-h-screen flex flex-col justify-center sm:py-12 relative z-10">
                    <New_password token={searchParams.token} flow={searchParams.flow} />
                </div>
            </div>
        </div>


    );
}