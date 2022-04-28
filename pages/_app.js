import React, { useEffect, useState } from "react";
import '../styles/globals.css'

function MyApp({ Component, pageProps, router }) {
  useEffect(() => {
	  console.log("OKOK");
  },[router.pathname])
  useEffect(() => {
    console.log("初回だけ走るよ〜");
  }, []);
  return <Component {...pageProps} />
}

export default MyApp
