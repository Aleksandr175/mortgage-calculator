import React, { useState } from 'react';
import axios from 'axios';
import { formatNumber } from './utils/formatNumber';
import styles from './MortgageCalculator.module.css';

interface ScheduleItem {
  month: number;
  paymentDate: string;
  beginningBalance: number;
  scheduledPayment: number;
  principalPayment: number;
  interestPayment: number;
  endingBalance: number;
}

const MortgageCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number | string>('');
  const [interestRate, setInterestRate] = useState<number | string>('');
  const [years, setYears] = useState<number>(30);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [totalInterest, setTotalInterest] = useState<number>(0);

  const handleCalculate = async () => {
    try {
      const response = await axios.get('http://localhost:3000/mortgage/calculate', {
        params: { principal: amount, annualInterestRate: interestRate, years },
      });
      setMonthlyPayment(response.data.monthlyPayment);

      const scheduleResponse = await axios.get('http://localhost:3000/mortgage/amortization-schedule', {
        params: { principal: amount, annualInterestRate: interestRate, years },
      });
      setSchedule(scheduleResponse.data);

      // Calculate the total interest paid
      const totalInterestPaid = scheduleResponse.data.reduce((acc: number, payment: ScheduleItem) => acc + payment.interestPayment, 0);
      setTotalInterest(totalInterestPaid);
    } catch (error) {
      console.error('Error calculating mortgage:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Mortgage Calculator</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCalculate();
        }}
      >
        <div className={styles['form-group']}>
          <label>Amount of Mortgage ($):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Interest Rate (%):</label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            min="0"
            max="100"
            step="0.1"
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Years:</label>
          <select value={years} onChange={(e) => setYears(Number(e.target.value))}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
        </div>
        <div className={styles['form-group']}>
          <button type="submit">Calculate</button>
        </div>
      </form>
      {monthlyPayment !== null && (
        <div className={styles.results}>
          <h2>Monthly Payment: {formatNumber(monthlyPayment)}</h2>
          <h2>Total Interest Paid: {formatNumber(totalInterest)}</h2>
          <h3>Amortization Schedule</h3>
          <table>
            <thead>
            <tr>
              <th>Month</th>
              <th>Payment Date</th>
              <th>Beginning Balance</th>
              <th>Scheduled Payment</th>
              <th>Principal Payment</th>
              <th>Interest Payment</th>
              <th>Ending Balance</th>
            </tr>
            </thead>
            <tbody>
            {schedule.map((payment, index) => (
              <tr key={index}>
                <td>{payment.month}</td>
                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td>{formatNumber(payment.beginningBalance)}</td>
                <td>{formatNumber(payment.scheduledPayment)}</td>
                <td>{formatNumber(payment.principalPayment)}</td>
                <td>{formatNumber(payment.interestPayment)}</td>
                <td>{formatNumber(payment.endingBalance)}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator;
