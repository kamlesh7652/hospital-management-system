import { FaEye, FaMoneyBillWave, FaCreditCard, FaBan } from "react-icons/fa";
import { money, patientName, STATUS_LABELS } from "./billUtils";

const BADGE = {
    pending: "bill-badge-warn",
    partially_paid: "bill-badge-info",
    paid: "bill-badge-ok",
    cancelled: "bill-badge-danger"
};

const BillList = ({ bills, onView, onPay, onPayOnline, onCancel }) => {
    if (bills.length === 0) {
        return <p className="bill-empty">Koi bill nahi mila.</p>;
    }

    return (
        <div className="bill-table-wrap">
            <table className="bill-table">
                <thead>
                    <tr>
                        <th>Bill No</th>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Due</th>
                        <th>Status</th>
                        <th className="bill-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((b) => {
                        const due = b.totalAmount - b.paidAmount;
                        const canPay = b.paymentStatus === "pending" || b.paymentStatus === "partially_paid";
                        const canCancel = b.paymentStatus === "pending";

                        return (
                            <tr key={b._id}>
                                <td className="bill-strong">{b.billNumber}</td>
                                <td>{patientName(b.patient)}</td>
                                <td>{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                                <td>{money(b.totalAmount)}</td>
                                <td>{money(b.paidAmount)}</td>
                                <td>{b.paymentStatus === "cancelled" ? "-" : money(due)}</td>
                                <td>
                                    <span className={`bill-badge ${BADGE[b.paymentStatus]}`}>
                                        {STATUS_LABELS[b.paymentStatus]}
                                    </span>
                                </td>
                                <td>
                                    <div className="bill-actions">
                                        <button title="View bill" onClick={() => onView(b)} className="bill-icon-btn view">
                                            <FaEye />
                                        </button>
                                        {canPay && (
                                            <button title="Add payment (cash/manual)" onClick={() => onPay(b)} className="bill-icon-btn pay">
                                                <FaMoneyBillWave />
                                            </button>
                                        )}
                                        {canPay && onPayOnline && (
                                            <button title="Pay online (UPI/Card)" onClick={() => onPayOnline(b)} className="bill-icon-btn pay">
                                                <FaCreditCard />
                                            </button>
                                        )}
                                        {canCancel && (
                                            <button title="Cancel bill" onClick={() => onCancel(b)} className="bill-icon-btn delete">
                                                <FaBan />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BillList;