import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllDomainInfos } from "../flow/scripts";

export default function Domains() {
  // Create a state variable for all the DomainInfo structs
  // Initialize it to an empty array
  const [domainInfos, setDomainInfos] = useState([]);

  // Load all the DomainInfo's by running the Cadence script
  // when the page is loaded
  useEffect(() => {
    async function fetchDomains() {
      const domains = await getAllDomainInfos();
      setDomainInfos(domains);
    }

    fetchDomains();
  }, []);

  return (
    <div className="px-10 pt-3 h-screen">
      <Head>
        <title>Flow Name Service</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="pt-5 px-10">
        <h1 className="text-center text-xl font-semibold pt-4">All Registered Domains</h1>

        <div className="flex justify-center pt-6 flex-wrap">
          {
            // If no domains were found, display a message highlighting that
            domainInfos.length === 0 ? (
            <p>No FNS Domains have been registered yet</p>
          ) : (
            // Otherwise, loop over the array, and render information
            // about each domain
            domainInfos.map((di, idx) => (
              <div className="border rounded-2xl px-7 py-5 space-y-3 bg-[#00A3E9] max-w-max mx-3 mb-3" key={idx}>
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
            ))
          )}
        </div>
      </main>
    </div>
  )
}