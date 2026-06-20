import React, { useEffect, useState } from "react";
import styles from "./ServerWakeupLoader.module.css";

const messages = [
  "🚀 Starting EquiSplit...",
  "⏳ Waking up servers...",
  "It may take few moments 😅",
  "🔒 Connecting securely...",
  "📊 Loading your data...",
  "✨ Almost ready...",
  "Just There wait a second",
  "Your Data is being sent",
  "Pipeline has a leakage wait",
  "Plumber arrived he will fix it",
  "Now data is received",
  "Ok restart and you will be signed up within 5 seconds",
];

export default function ServerWakeupLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) =>
        prev < messages.length - 1 ? prev + 1 : prev
      );
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>

      <h2 className={styles.title}>
        {messages[index]}
      </h2>

      <p className={styles.subtitle}>
        Thank
      </p>
    </div>
  );
}