import { FaEdit, FaTrash } from 'react-icons/fa';

export default function DoctorList({ doctors, onEdit, onDeactivate }) {
  return (
    <div className="doc-table-wrap">
      <div className="doc-table-head">
        <h2>All doctors</h2>
        <span>{doctors.length} total</span>
      </div>

      {doctors.length === 0 ? (
        <p className="empty-state">No doctors yet. Add your first doctor above.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Fee</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d._id}>
                <td>{d.user?.name}</td>
                <td>{d.specialization}</td>
                <td>{d.experience} yrs</td>
                <td>₹{d.consultationFee}</td>
                <td>
                  <span className={`status-pill${d.user?.isActive ? '' : ' inactive'}`}>
                    {d.user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="row-actions">
                    <button
                      className="icon-btn icon-edit"
                      onClick={() => onEdit(d)}
                      aria-label={`Edit ${d.user?.name}`}
                      data-tooltip="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                    {d.user?.isActive && (
                      <button
                        className="icon-btn icon-delete"
                        onClick={() => onDeactivate(d._id)}
                        aria-label={`Deactivate ${d.user?.name}`}
                        data-tooltip="Deactivate"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}