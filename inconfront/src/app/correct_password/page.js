'use client';

import '../style/new_account.css';

import Correct_password from '../components/correct_password';
import { useEffect } from 'react';

export default function New_account() {

    useEffect(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => console.log('scope is: ', registration.scope));
        }
      }, []);

    return (
        <div className="bg-account relative">
            <div className="absolute inset-0"></div>
            <div className="bg-logo relative z-10">
                <span className="font-zen-kaku font-color-c font-bold"></span>
                <p className="font-color-p relative z-10"></p>
                <div className=" min-h-screen flex flex-col justify-center sm:py-12 relative z-10">
                    <Correct_password />
                </div>
            </div>
        </div>


    );
}