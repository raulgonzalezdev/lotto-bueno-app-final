// Conversations.tsx
"use client";
import React, { useState, useEffect } from "react";

interface Conversation {
  id: number;
  user_id: number;
  session_id: string;
  timestamp: string;
  content: any; // Assuming content is a JSON object
}

const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationsPerPage] = useState(10);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const response = await fetch("/api/conversations");
    const data: Conversation[] = await response.json();
    setConversations(data);
  };

  const openModal = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedConversation(null);
  };

  const indexOfLastConversation = currentPage * conversationsPerPage;
  const indexOfFirstConversation = indexOfLastConversation - conversationsPerPage;
  const currentConversations = conversations.slice(indexOfFirstConversation, indexOfLastConversation);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <h2>Conversaciones</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Session ID</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentConversations.map((conversation) => (
            <tr key={conversation.id}>
              <td>{conversation.id}</td>
              <td>{conversation.user_id}</td>
              <td>{conversation.session_id}</td>
              <td>{new Date(conversation.timestamp).toLocaleString()}</td>
              <td>
                <button className="view-details-button"   onClick={() => openModal(conversation)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {[...Array(Math.ceil(conversations.length / conversationsPerPage)).keys()].map((number) => (
          <button key={number} onClick={() => paginate(number + 1)}>
            {number + 1}
          </button>
        ))}
      </div>
      {modalIsOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Detalle de la Conversación</h2>
            <pre>{JSON.stringify(selectedConversation, null, 2)}</pre>
            <button className="modal-close-button" onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
