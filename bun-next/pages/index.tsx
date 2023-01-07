import Head from "next/head";
import React from "react";
import styles from "../styles/Home.module.css";
import nextPackage from "next/package.json";

export default function Home({}) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Hello from AJC and the Web Devs
        </h1>
      </main>
    </div>
  );
}