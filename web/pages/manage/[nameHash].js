import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as fcl from "@onflow/fcl";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import { getDomainInfoByNameHash, getRentCost } from "../../flow/scripts";
import styles from "../../styles/ManageDomain.module.css";
import {
  renewDomain,
  updateAddressForDomain,
  updateBioForDomain,
} from "../../flow/transactions";

// constant representing seconds per year
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export default function ManageDomain() {
  // Use AuthContext to gather data for current user
  const { currentUser, isInitialized } = useAuth();

  // Next Router to get access to `nameHash` query parameter
  const router = useRouter();
  // State variable to store the DomainInfo
  const [domainInfo, setDomainInfo] = useState();
  // State variable to store the bio given by user
  const [bio, setBio] = useState("");
  // State variable to store the address given by user
  const [linkedAddr, setLinkedAddr] = useState("");
  // State variable to store how many years to renew for
  const [renewFor, setRenewFor] = useState(1);
  // Loading state
  const [loading, setLoading] = useState(false);
  // State variable to store cost of renewal
  const [cost, setCost] = useState(0.0);

    
  // Function to load the domain info
  async function loadDomainInfo() {
    try {
      const info = await getDomainInfoByNameHash(
        currentUser.addr,
        router.query.nameHash
      );
      console.log(info);
      setDomainInfo(info);
    } catch (error) {
      console.error(error);
    }
  }

  // Function which updates the bio transaction
  async function updateBio() {
    try {
      setLoading(true);
      const txId = await updateBioForDomain(router.query.nameHash, bio);
      await fcl.tx(txId).onceSealed();
      await loadDomainInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function which updates the address transaction
  async function updateAddress() {
    try {
      setLoading(true);
      const txId = await updateAddressForDomain(
        router.query.nameHash,
        linkedAddr
      );
      await fcl.tx(txId).onceSealed();
      await loadDomainInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function which runs the renewal transaction
  async function renew() {
    try {
      setLoading(true);
      if (renewFor <= 0)
        throw new Error("Must be renewing for at least one year");
      const duration = (renewFor * SECONDS_PER_YEAR).toFixed(1).toString();
      const txId = await renewDomain(
        domainInfo.name.replace(".fns", ""),
        duration
      );
      await fcl.tx(txId).onceSealed();
      await loadDomainInfo();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function which calculates cost of renewal
  async function getCost() {
    if (domainInfo && domainInfo.name.replace(".fns", "").length > 0 && renewFor > 0) {
      const duration = (renewFor * SECONDS_PER_YEAR).toFixed(1).toString();
      const c = await getRentCost(
        domainInfo.name.replace(".fns", ""),
        duration
      );
      setCost(c);
    }
  }

  // Load domain info if user is initialized and page is loaded
  useEffect(() => {
    if (router && router.query && isInitialized) {
      loadDomainInfo();
    }
  }, [router]);

  // Calculate cost everytime domainInfo or duration changes
  useEffect(() => {
    getCost();
  }, [domainInfo, renewFor]);

  if (!domainInfo) return null;

  return (
    <div className="px-10 pt-3 h-screen">
      <Head>
        <title>Flow Name Service - Manage Domain</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="pt-10 px-10 flex justify-center space-x-10">
        <div className="rounded-lg text-white p-4 space-y-2 bg-[#00A3E9]">
          <h1 className="text-4xl font-semibold text-white pb-5">{domainInfo.name}</h1>
          <p>ID: {domainInfo.id}</p>
          <p>Owner: {domainInfo.owner}</p>
          <p>
            Created At:{" "}
            {new Date(
              parseInt(domainInfo.createdAt) * 1000
            ).toLocaleDateString()}
          </p>
          <p>
            Expires At:{" "}
            {new Date(
              parseInt(domainInfo.expiresAt) * 1000
            ).toLocaleDateString()}
          </p>
          <hr />
          <p>Bio: {domainInfo.bio ? domainInfo.bio : "Not Set"}</p>
          <p>Address: {domainInfo.address ? domainInfo.address : "Not Set"}</p>
        </div>

        <div className="border border-dashed rounded-lg border-blue-500 space-y-5 flex flex-col items-center py-2 px-4">
          <h1 className="text-center font-semibold">Update Info</h1>
          <div className="space-y-1">
            <span className="font-semibold text-sm text-gray-600">Bio: </span>
            <div className="border rounded-lg max-w-max py-1 pr-1 pl-2 border-blue-500">
                <input className="focus:outline-none"
                type="textarea"
                placeholder="Lorem ipsum..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                />
                <button onClick={updateBio} disabled={loading} className="rounded-lg text-sm ml-2 px-4 py-2 bg-blue-500 text-white">
                Update
                </button>
            </div>
          </div>

          <div className='space-y-1'>
            <span className="font-semibold text-sm text-gray-600">Link Address: </span>
            <div className="border rounded-lg max-w-max py-1 pr-1 pl-2 border-blue-500">
                <input className="focus:outline-none"
                type="text"
                placeholder="0xabcdefgh"
                value={linkedAddr}
                onChange={(e) => setLinkedAddr(e.target.value)}
                />
                <button onClick={updateAddress} disabled={loading} className="rounded-lg ml-2 px-4 py-2 text-sm bg-blue-500 text-white">
                Update
                </button>
            </div>
          </div>
        
          <div className="flex flex-col items-center space-y-3 pt-5">
            <h1 className="font-semibold">Renew</h1>
            <div className="border rounded-lg px-3 py-1 border-blue-500">
                <input className="focus:outline-none"
                type="number"
                placeholder="1"
                value={renewFor}
                onChange={(e) => setRenewFor(e.target.value)}
                />
                <span className=" text-blue-500 pl-1"> years</span>
            </div>
            <button onClick={renew} disabled={loading} className='rounded-full px-6 py-2 bg-blue-500 text-white'>
            Renew Domain
            </button>
            <p className="text-sm font-semibold text-blue-500">Cost: {cost} FLOW</p>
            {loading && <p>Loading...</p>}
            </div>
          </div>
      </main>
    </div>
  );
}