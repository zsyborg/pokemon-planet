"use client";

import { timeStamp } from "console";
import Image from "next/image";
import { parse } from "path";
import { useEffect, useState } from "react";
import React from "react";

export default function Auctions() {
    const [auctions, setAuctions] = useState<any[]>([]);
    const [now, setNow] = useState(Date.now());
    const [bid, setBid] = useState<number | null>(null);
    const [activeAuctionId, setActiveAuctionId] = useState<string | null>(null);

    const [bidStream, setBidStream] = useState<any[]>([]);

    useEffect(() => {
        fetch(`/api/auction`)
        .then(res => res.json())
        .then(data => {
            setAuctions(data);
            if (data.length > 0) {
                setActiveAuctionId(data[0]._id);
            } else {
              setActiveAuctionId(null);
            }
        });

         const timer = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(timer);

    }, []);

    useEffect(() => {
        if (activeAuctionId) {
            fetch(`/api/auction/${activeAuctionId}`)
            .then(res => res.json())
            .then(data => {
                const parsed = parseBids(data.bids);
                setBidStream(parsed);
                console.log("Parsed bids:", parsed);
                console.log("Bids data:", data);
            });
        } else {
            setBidStream([]);
        }
    }, [activeAuctionId]);


    function parseBids(bids: any[]) {
      const result = [];
      for (let i = 0; i < bids.length; i += 2) {
        const member = bids[i];
        const amount = bids[i + 1];

        const [user, timeStamp] = member.split(":");
        result.push({ 
          user, 
          bid: Number(amount),
          timeStamp: new Date(Number(timeStamp))
        });
      }

      return result;
    }

    function placeBid(bidId: any) {
      setActiveAuctionId(bidId);
      console.log("Placing bid for auction ID:", bidId);
        fetch(`/api/auction/${bidId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({thebidId: bidId, user: "zasha", bid: bid, timeStamp: now}),
        })
        .then(res => res.json())
        .then(() => {
            // Refetch bids
            fetch(`/api/auction/${bidId}`)
            .then(res => res.json())
            .then(data => {
                const parsed = parseBids(data.bids);
                setBidStream(parsed);
            });
        });
        console.log("Bid placed for auction ID:", bidId);
    }


  function convertDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }


function getRemainingTime(endDate: string) {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      return "Auction ended";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
}



  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
       <h2>Auctions</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>

          {auctions.map((auction: any) => 
         <React.Fragment key={auction._id}>
            <p>{auction.name}</p>
            <p>{convertDate(auction.end)}</p>
            <p>⏳ {getRemainingTime(auction.end)}</p>
            <hr />
            <input onChange={(e) => setBid(Number(e.target.value))} type="number" placeholder="Your Bid" className="bg-orange-400 text-black" /><br/>
            <button onClick={() => placeBid(auction._id)}>Place Bid</button>
            
        </React.Fragment>
            )}
            </div>
            <div className="h-52 overflow-y-scroll">
            <h3>Bids Stream</h3>
            {bidStream.length === 0 ? (
              <p className="text-gray-500 italic">
                No bids yet. Be the first to bid 🚀
              </p>
            ) : (
              bidStream.map((bid: any) => (
                <div key={`${bid.user}-${bid.timeStamp}`}>
                  <p>User: {bid.user}</p>
                  <p>Bid: ₹{bid.bid}</p>
                  <p>Time: {convertDate(bid.timeStamp)}</p>
                  <hr />
                </div>
              ))
            )}

          </div>  
          </div>  
      </main>
    </div>
  );
}
