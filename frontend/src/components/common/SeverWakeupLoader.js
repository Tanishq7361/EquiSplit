import React, { useEffect, useState } from "react";
import styles from "./ServerWakeupLoader.module.css";

const messages = [
  "🚀 Starting EquiSplit...",
  "⏳ Waking up servers...",
  "🔒 Connecting securely...",
  "📊 Loading your data...",
  "✨ Almost ready..."
];

export default function ServerWakeupLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) =>
        prev < messages.length - 1 ? prev + 1 : prev
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>

      <h2 className={styles.title}>
        {messages[index]}
      </h2>

      <p className={styles.subtitle}>
        This may take up to a minute if the server is sleeping.
      </p>
    </div>
  );
}