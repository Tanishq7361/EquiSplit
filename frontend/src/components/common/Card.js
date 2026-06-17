import React from 'react';
import styles from './Card.module.css';
import { classNames } from '../../utils/formatters';

export function Card({ children, hoverable, clickable, className, ...props }) {
  return (
    <div
      className={classNames(
        styles.card,
        hoverable && styles.hoverable,
        clickable && styles.clickable,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, title, actions, className }) {
  return (
    <div className={classNames(styles.header, className)}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
      {actions && <div>{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={classNames(styles.body, className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={classNames(styles.footer, className)}>{children}</div>;
}
