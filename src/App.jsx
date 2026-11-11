import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  // Modals States
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState([]);

  const [formData, setFormData] = useState({
    agencyId: '',
    bookingId: '',
    issueCategory: 'Flight Cancellation',
    checkInDate: ''
  });

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tickets/all');
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchTickets().catch(console.error);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/tickets/create', formData);
      setFormData({ agencyId: '', bookingId: '', issueCategory: 'Flight Cancellation', checkInDate: '' });
      await fetchTickets();
    } catch (error) {
      console.error("Error creating ticket", error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}/resolve`);
      await fetchTickets();
    } catch (error) {
      console.error("Error resolving ticket", error);
    }
  };

  const handleEscalate = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}/escalate`);
      await fetchTickets();
      setActiveTab('ESCALATED');
    } catch (error) {
      console.error("Error escalating ticket", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/tickets/delete/${id}`);
      await fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket", error);
    }
  };

  const handleAssign = async (id, assignee) => {
    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}/assign?assignee=${assignee}`);
      await fetchTickets();
    } catch (error) {
      console.error("Error assigning ticket", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage) return;
    try {
      const response = await axios.post(`http://localhost:8080/api/tickets/${selectedTicket.id}/message`, {
        message: newMessage
      });
      setSelectedTicket(response.data);
      setNewMessage('');
      await fetchTickets();
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const openChatModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowChatModal(true);
  };

  const openTimelineModal = (ticket) => {
    setSelectedTimeline(ticket.auditTimeline || []);
    setShowTimelineModal(true);
  };

  const checkSlaRisk = (checkInDate) => {
    if (!checkInDate) return false;
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  const totalTickets = tickets.length;
  const escalatedCount = tickets.filter(t => t.status === 'ESCALATED').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  const categoryCounts = tickets.reduce((acc, t) => {
    acc[t.issueCategory] = (acc[t.issueCategory] || 0) + 1;
    return acc;
  }, {});

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.agencyId.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'ESCALATED') {
      return matchesSearch && ticket.status === 'ESCALATED';
    }
    return matchesSearch && ticket.status !== 'ESCALATED';
  });

  return (
      <div className="bg-light min-vh-100 d-flex flex-column justify-content-between">
        <div>
          {/* Top Navbar with Developer Branding */}
          <nav className="navbar navbar-dark bg-gradient bg-dark shadow-sm mb-4 py-3 border-bottom border-secondary">
            <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
              <div>
              <span className="navbar-brand mb-0 h1 fw-bold fs-4 text-warning">
                ⚡ TBO OpsDesk Pro
              </span>
                <span className="text-muted ms-2 small d-none d-md-inline">| Enterprise B2B Ticketing & Audit Engine</span>
              </div>
              <div className="text-end">
              <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm">
                👨‍💻 Lead Architect & Developer: <strong className="text-warning">Hrittik</strong>
              </span>
              </div>
            </div>
          </nav>

          <div className="container-fluid px-4">

            {/* Insights Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card shadow-sm border-0 bg-white p-3 rounded-3 border-start border-4 border-primary">
                  <h6 className="text-muted small fw-bold mb-1">TOTAL TICKETS</h6>
                  <h3 className="fw-bold text-primary mb-0">{totalTickets}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm border-0 bg-white p-3 rounded-3 border-start border-4 border-danger">
                  <h6 className="text-muted small fw-bold mb-1">ESCALATED QUEUE</h6>
                  <h3 className="fw-bold text-danger mb-0">{escalatedCount}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm border-0 bg-white p-3 rounded-3 border-start border-4 border-success">
                  <h6 className="text-muted small fw-bold mb-1">RESOLVED TICKETS</h6>
                  <h3 className="fw-bold text-success mb-0">{resolvedCount}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm border-0 bg-white p-3 rounded-3 border-start border-4 border-warning">
                  <h6 className="text-muted small fw-bold mb-1">TOP ISSUE THEME</h6>
                  <p className="mb-0 fw-bold text-dark text-truncate fs-5">
                    {Object.keys(categoryCounts).length > 0
                        ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
                        : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Left Column: Form */}
              <div className="col-md-3 mb-4">
                <div className="card shadow-sm border-0 rounded-3">
                  <div className="card-header bg-primary text-white py-3">
                    <h6 className="mb-0 fw-bold">📝 Create New Ticket</h6>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Agency ID</label>
                        <input type="text" className="form-control form-control-sm" name="agencyId" value={formData.agencyId} onChange={handleInputChange} placeholder="e.g. AG-886" required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Booking ID (TBOH)</label>
                        <input type="text" className="form-control form-control-sm" name="bookingId" value={formData.bookingId} onChange={handleInputChange} placeholder="e.g. TBOH-9999" required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Issue Category</label>
                        <select className="form-select form-select-sm" name="issueCategory" value={formData.issueCategory} onChange={handleInputChange}>
                          <option>Flight Cancellation</option>
                          <option>Refund Issue</option>
                          <option>Hotel Modification</option>
                          <option>Name Change</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Check-In Date</label>
                        <input type="date" className="form-control form-control-sm" name="checkInDate" value={formData.checkInDate} onChange={handleInputChange} required />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold py-2 shadow-sm">Submit Ticket</button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Column: Queues & Tabs */}
              <div className="col-md-9">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button className={`nav-link fw-bold ${activeTab === 'ALL' ? 'active shadow-sm' : ''}`} onClick={() => setActiveTab('ALL')}>
                      Active Queue (L1 Support)
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link fw-bold text-danger ${activeTab === 'ESCALATED' ? 'active shadow-sm' : ''}`} onClick={() => setActiveTab('ESCALATED')}>
                      Escalation Queue (Managers) ⚠️
                    </button>
                  </li>
                </ul>

                <div className="mb-3">
                  <input
                      type="text"
                      className="form-control shadow-sm"
                      placeholder="🔍 Search by Agency ID or Booking ID to view full multi-ticket history..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                  <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-dark">
                      <tr>
                        <th className="py-3 ps-3">Booking ID</th>
                        <th className="py-3">Agency</th>
                        <th className="py-3">Travel Date</th>
                        <th className="py-3">Assignee</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-end pe-3">Action</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredTickets.map((ticket) => {
                        const isAtRisk = checkSlaRisk(ticket.checkInDate);
                        return (
                            <tr key={ticket.id}>
                              <td className="ps-3">
                                <strong className="text-dark">{ticket.bookingId}</strong><br/>
                                <small className="text-muted">{ticket.issueCategory}</small>
                              </td>
                              <td><span className="badge bg-secondary">{ticket.agencyId}</span></td>
                              <td>
                                {ticket.checkInDate}
                                {isAtRisk && ticket.status !== 'RESOLVED' && (
                                    <span className="badge bg-danger ms-2">SLA Risk 🚨</span>
                                )}
                              </td>
                              <td>
                                <select
                                    className="form-select form-select-sm shadow-sm"
                                    value={ticket.assignee || 'Unassigned'}
                                    onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                    disabled={ticket.status === 'RESOLVED'}
                                >
                                  <option value="Unassigned">Unassigned</option>
                                  <option value="Agent Hrittik">Hrittik (Lead)</option>
                                  <option value="Agent Support">Support Agent</option>
                                  <option value="Manager Escalations">Escalation Manager</option>
                                </select>
                              </td>
                              <td>
                              <span className={`badge px-2 py-1 ${ticket.status === 'OPEN' ? 'bg-primary' : ticket.status === 'ESCALATED' ? 'bg-danger' : 'bg-success'}`}>
                                {ticket.status}
                              </span>
                              </td>
                              <td className="text-end pe-3">
                                {/* Audit Log Timeline Button */}
                                <button
                                    className="btn btn-sm btn-outline-secondary me-1 mb-1 fw-bold"
                                    onClick={() => openTimelineModal(ticket)}
                                    title="Activity Audit Timeline"
                                >
                                  ⏳ Audit Log
                                </button>

                                {/* Supplier Thread Button */}
                                <button
                                    className="btn btn-sm btn-outline-info me-1 mb-1 fw-bold"
                                    onClick={() => openChatModal(ticket)}
                                    title="Supplier Side Conversation"
                                >
                                  💬 Thread ({ticket.sideConversations ? ticket.sideConversations.length : 0})
                                </button>

                                {ticket.status === 'OPEN' && (
                                    <>
                                      <button className="btn btn-sm btn-outline-success me-1 mb-1 fw-bold" onClick={() => handleResolve(ticket.id)}>Resolve</button>
                                      <button className="btn btn-sm btn-outline-warning text-dark me-1 mb-1 fw-bold" onClick={() => handleEscalate(ticket.id)}>Escalate ⚠️</button>
                                    </>
                                )}
                                {ticket.status === 'ESCALATED' && (
                                    <button className="btn btn-sm btn-outline-success me-1 mb-1 fw-bold" onClick={() => handleResolve(ticket.id)}>Resolve</button>
                                )}
                                <button className="btn btn-sm btn-outline-danger mb-1" onClick={() => handleDelete(ticket.id)} title="Delete Ticket">🗑️</button>
                              </td>
                            </tr>
                        )
                      })}
                      </tbody>
                    </table>
                    {filteredTickets.length === 0 && (
                        <div className="p-5 text-center text-muted">
                          <h5>No tickets found in this queue.</h5>
                          <p className="small mb-0">Create a ticket using the form on the left to get started.</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Side Conversation Modal */}
        {showChatModal && selectedTicket && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-3">
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title fs-6">
                      💬 Supplier & Agency Thread — <span className="text-warning">{selectedTicket.bookingId}</span>
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowChatModal(false)}></button>
                  </div>
                  <div className="modal-body bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {(!selectedTicket.sideConversations || selectedTicket.sideConversations.length === 0) ? (
                        <p className="text-muted text-center small my-4">No side conversations yet. Start a thread with the supplier below.</p>
                    ) : (
                        selectedTicket.sideConversations.map((msg, index) => (
                            <div key={index} className="card mb-2 border-0 shadow-sm p-2 bg-white small">
                              <p className="mb-0 text-dark">👤 {msg}</p>
                            </div>
                        ))
                    )}
                  </div>
                  <div className="modal-footer bg-white border-top">
                    <form onSubmit={handleSendMessage} className="w-100 d-flex gap-2">
                      <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Type message to supplier/agency..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          required
                      />
                      <button type="submit" className="btn btn-primary btn-sm fw-bold">Send</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Audit Timeline Modal */}
        {showTimelineModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-3">
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title fs-6">
                      ⏳ Ticket Activity Audit Trail
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowTimelineModal(false)}></button>
                  </div>
                  <div className="modal-body bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedTimeline.length === 0 ? (
                        <p className="text-muted text-center small my-4">No audit logs available for this ticket yet.</p>
                    ) : (
                        <ul className="list-group list-group-flush small">
                          {selectedTimeline.map((log, index) => (
                              <li key={index} className="list-group-item bg-white mb-1 border-0 shadow-sm rounded text-dark">
                                🔹 {log}
                              </li>
                          ))}
                        </ul>
                    )}
                  </div>
                  <div className="modal-footer bg-white border-top">
                    <button type="button" className="btn btn-secondary btn-sm w-100 fw-bold" onClick={() => setShowTimelineModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Branded Footer with Developer Credit */}
        <footer className="bg-dark text-white text-center py-3 mt-5 border-top border-secondary">
          <div className="container px-4">
            <p className="mb-0 small text-light">
              TBO OpsDesk Enterprise Operations Platform v2.0 | Designed & Engineered with ❤️ by <strong className="text-warning">Hrittik</strong> (Lead Developer)
            </p>
          </div>
        </footer>
      </div>
  );
}

export default App;