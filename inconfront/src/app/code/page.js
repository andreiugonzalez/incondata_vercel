'use client';

import '../style/verification.css';

import Verification from '../components/verification';

export default function New_account() {
    return (
        <div className="bg-verification relative">
            <div className="absolute inset-0"></div>
            <div className="bg-logo-verification relative z-10">
                <span className="font-zen-kaku font-construyendo-2 font-bold"></span>
                <p className="font-parrafo-2 relative z-10"></p>
                <div className=" min-h-screen flex flex-col justify-center sm:py-12 relative z-10">
                    <Verification />
                </div>
            </div>
        </div>


    );
}