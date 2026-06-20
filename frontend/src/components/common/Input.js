import React from 'react';
import styles from './Input.module.css';
import { classNames } from '../../utils/formatters';

/**
 * Accessible form input with label, error, hint, and icon slots.
 */
export default function Input({
  label,
  name,
  error,
  hint,
  icon,
  className,
  as: Tag = 'input',
  ...props
}) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <Tag
          id={inputId}
          name={name}
          onWheel={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (
              props.type === "number" &&
              (e.key === "ArrowUp" || e.key === "ArrowDown")
            ) {
              e.preventDefault();
            }

            props.onKeyDown?.(e);
          }}
          className={classNames(
            styles.input,
            icon && styles.hasIcon,
            error && styles.error,
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      </div>
      {error && (
        <span id={errorId} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
