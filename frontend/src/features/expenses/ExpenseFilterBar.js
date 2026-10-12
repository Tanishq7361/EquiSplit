import React from 'react';
import styles from './ExpenseFilterBar.module.css';
import { FiSearch, FiX, FiCalendar, FiUser, FiFilter } from 'react-icons/fi';

export const DATE_PRESETS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

export default function ExpenseFilterBar({
  searchQuery,
  onSearchChange,
  datePreset,
  onDatePresetChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  selectedPerson,
  onSelectedPersonChange,
  members = [],
  onClearFilters,
  totalResults,
  isFiltered,
}) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.mainControlsRow}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} size={15} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search expenses by description, payer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className={styles.selectsGroup}>
          {/* Date Preset Select */}
          <div className={styles.selectWrapper}>
            <FiCalendar className={styles.selectIcon} size={14} />
            <select
              className={styles.filterSelect}
              value={datePreset}
              onChange={(e) => onDatePresetChange(e.target.value)}
              aria-label="Filter by date"
            >
              {DATE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Person Select */}
          <div className={styles.selectWrapper}>
            <FiUser className={styles.selectIcon} size={14} />
            <select
              className={styles.filterSelect}
              value={selectedPerson}
              onChange={(e) => onSelectedPersonChange(e.target.value)}
              aria-label="Filter by person"
            >
              <option value="all">All People</option>
              {members.map((m) => {
                const identifier = m.name || m.email;
                return (
                  <option key={m.id || identifier} value={identifier}>
                    {m.name || m.email}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={onClearFilters}
              title="Reset all search and filter conditions"
            >
              <FiX size={13} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Row */}
      {datePreset === 'custom' && (
        <div className={styles.customDateRow}>
          <span className={styles.customDateLabel}>
            <FiFilter size={13} /> Date Range:
          </span>
          <div className={styles.dateInputGroup}>
            <label htmlFor="startDateInput" className={styles.dateLabel}>From:</label>
            <input
              id="startDateInput"
              type="date"
              className={styles.dateInput}
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label htmlFor="endDateInput" className={styles.dateLabel}>To:</label>
            <input
              id="endDateInput"
              type="date"
              className={styles.dateInput}
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
