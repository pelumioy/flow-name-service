import * as fcl from "@onflow/fcl";
import Head from "next/head";
import Link from "next/link";
import {useEffect, useState} from "react";
import Navbar from "../../components/Navbar";
import {useAuth} from "../../contexts/AuthContext";
import {getMyDomainInfos} from "../../flow/scripts";
import {initializeAccount} from "../../flow/transactions";

export default function Home() {
  // Use the AuthContext to track user data
  const { currentUser, isInitialized, checkInit } = useAuth();
  const [domainInfos, setDomainInfos] = useState([]);

  // Function to initialize the user's account if not already initialized
  async function initialize() {
    try {
      const txId = await initializeAccount();
      await fcl.tx(txId).onceSealed();
      await checkInit();
    } catch (error) {
      console.error(error);
    }
  }

  // Function to fetch the domains owned by the currentUser
  async function fetchMyDomains() {
    try {
      const domains = await getMyDomainInfos(currentUser.addr);
      setDomainInfos(domains);
    } catch (error) {
      console.error(error.message);
    }
  }

  // Load user-owned domains if they are initialized
  // Run if value of `isInitialized` changes
  useEffect(() => {
    if (isInitialized) {
      fetchMyDomains();
    }
  }, [isInitialized]);

  return (
    <div className="px-10 pt-3 h-screen">
      <Head>
        <title>Flow Name Service - Manage</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="pt-5 px-10">
        <h1 className="text-center text-xl font-semibold pt-4">Your Registered Domains</h1>

        {!isInitialized ? (
          <div className="flex flex-col items-center justify-center space-y-3  pt-20">
            <p>Your account has not been initialized yet</p>
            <button onClick={initialize} className='rounded-full px-6 py-2 bg-blue-500 text-white'>Initialize Account</button>
          </div>
        ) : (
            <div className="flex justify-center pt-6 flex-wrap">
            {
              // If no domains were found, display a message highlighting that
              domainInfos.length === 0 ? (
              <p>No FNS Domains have been registered yet</p>
            ) : (
              // Otherwise, loop over the array, and render information
              // about each domain
              domainInfos.map((di, idx) => (
                <Link href={`/manage/${di.nameHash}`} key={idx} >
                    <a >
                        <div className="border rounded-2xl px-7 py-5 space-y-3 bg-[#00A3E9] max-w-max mx-3 mb-3">
                        <p className="text-5xl pb-2 text-white">
                            {di.name}
                        </p>
                        <div className="rounded-lg text-center bg-white text-[#00A3E9] text-sm px-4 py-1 max-w-max">
                            <p >{di.owner}</p>
                        </div>
                        <p className="text-xs pt-5 text-gray-200 text-right">
                            Expires:{" "}
                            {new Date(parseInt(di.expiresAt) * 1000).toLocaleDateString()}
                        </p>
                        </div>
                    </a>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}