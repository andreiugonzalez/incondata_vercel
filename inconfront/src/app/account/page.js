"use client";

import "../style/new_account.css";

import Create from "../components/create_account";

export default function New_account() {
    return (
        <div className="bg-account relative">
            <div className="absolute inset-0"></div>
            <div className="relative z-10">
                <span className="font-zen-kaku font-color-c font-bold"></span>
                <p className="font-color-p relative z-10"></p>
                <div className=" min-h-screen flex flex-col justify-center sm:py-12 relative z-10">
                    <Create />
                </div>
            </div>
        </div>


    );
}
