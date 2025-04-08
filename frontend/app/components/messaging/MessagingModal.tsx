import React, { useState, useEffect, useRef } from "react";
import { useSendSMS, useSendBulkSMS, detectOperador } from "../../hooks/useSendSMS";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'contact';
  status?: 'sending' | 'sent' | 'failed';
  contactId: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  cedula?: string;
  estado?: string;
  municipio?: string;
  numero_ticket?: string;
}

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContacts: Contact[];
  initialTemplate?: string;
  enableAttachments?: boolean;
}

const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  initialContacts,
  initialTemplate = "",
  enableAttachments = true
}) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual');
  const [currentMessage, setCurrentMessage] = useState(initialTemplate);
  const [messageSending, setMessageSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  
  const [templates, setTemplates] = useState<string[]>([
    "Hola {nombre}, gracias por registrarte en Lotto Bueno. Tu ticket #{ticket} ha sido confirmado.",
    "Estimado/a {nombre}, te recordamos que tu ticket #{ticket} participa en nuestro próximo sorteo.",
    "¡Felicitaciones {nombre}! Tu ticket #{ticket} ha sido seleccionado para participar en nuestro sorteo especial."
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const sendSMSMutation = useSendSMS();
  const sendBulkSMSMutation = useSendBulkSMS();

  useEffect(() => {
    if (initialContacts.length > 0) {
      setContacts(initialContacts);
    }
  }, [initialContacts]);

  const addAttachment = () => {
    if (attachmentUrl.trim() && !attachments.includes(attachmentUrl)) {
      setAttachments([...attachments, attachmentUrl]);
      setAttachmentUrl("");
    }
  };

  const removeAttachment = (url: string) => {
    setAttachments(attachments.filter(a => a !== url));
  };

  const applyTemplate = (template: string) => {
    if (!selectedContact && activeTab === 'individual') {
      setErrorMessage("Por favor selecciona un contacto primero");
      return;
    }

    let personalizedMessage = template;
    
    if (activeTab === 'individual' && selectedContact) {
      personalizedMessage = template
        .replace(/{nombre}/g, selectedContact.name || "")
        .replace(/{ticket}/g, selectedContact.numero_ticket || "")
        .replace(/{cedula}/g, selectedContact.cedula || "")
        .replace(/{estado}/g, selectedContact.estado || "");
    }
    
    setCurrentMessage(personalizedMessage);
  };

  const prepareMessage = (baseMessage: string) => {
    if (attachments.length > 0) {
      return `${baseMessage}\n\nAdjuntos:\n${attachments.join('\n')}`;
    }
    return baseMessage;
  };

  const sendMessage = async () => {
    if (!selectedContact) {
      setErrorMessage("Por favor selecciona un contacto");
      return;
    }

    if (!currentMessage.trim()) {
      setErrorMessage("Por favor escribe un mensaje");
      return;
    }
    
    setMessageSending(true);
    setErrorMessage("");
    
    try {
      const messageWithAttachments = prepareMessage(currentMessage);
      
      const result = await sendSMSMutation.mutateAsync({
        phone: selectedContact.phone,
        message: messageWithAttachments,
      });
      
      setSuccessMessage(`Mensaje enviado exitosamente a ${selectedContact.name}`);
      setCurrentMessage("");
      
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === selectedContact.id 
            ? { 
                ...contact, 
                lastMessage: messageWithAttachments,
                lastMessageTime: new Date().toISOString() 
              } 
            : contact
        )
      );
    } catch (error) {
      setErrorMessage(`Error al enviar mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setMessageSending(false);
    }
  };

  const sendBulkMessages = async () => {
    if (contacts.length === 0) {
      setErrorMessage("No hay contactos para enviar mensajes");
      return;
    }

    if (!currentMessage.trim()) {
      setErrorMessage("Por favor escribe un mensaje");
      return;
    }
    
    setMessageSending(true);
    setErrorMessage("");
    
    try {
      const messageWithAttachments = prepareMessage(currentMessage);
      
      const messagesToSend = contacts.map(contact => {
        let personalizedMessage = messageWithAttachments
          .replace(/{nombre}/g, contact.name || "")
          .replace(/{ticket}/g, contact.numero_ticket || "")
          .replace(/{cedula}/g, contact.cedula || "")
          .replace(/{estado}/g, contact.estado || "");
          
        return {
          phone: contact.phone,
          message: personalizedMessage
        };
      });
      
      const result = await sendBulkSMSMutation.mutateAsync({
        messages: messagesToSend,
        batch_size: 25
      });
      
      if (result.success) {
        setSuccessMessage(`Se enviaron ${result.summary.success} mensajes exitosamente. ${result.summary.failed} fallidos.`);
      } else {
        setErrorMessage(`Error al enviar mensajes: ${result.message || 'Error desconocido'}`);
      }
      
    } catch (error) {
      setErrorMessage(`Error al enviar mensajes masivos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setMessageSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'block' : 'hidden'} fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full`}>
      <div className="modal-content mx-auto my-8 p-4 bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Enviar Mensajes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        
        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 border-l-4 border-green-500 text-green-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 border-l-4 border-red-500 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex border-b mb-4">
          <button
            className={`py-2 px-4 ${activeTab === 'individual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('individual')}
          >
            Mensaje Individual
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'bulk' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('bulk')}
          >
            Mensaje Masivo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeTab === 'individual' && (
            <div className="border rounded p-2 overflow-y-auto max-h-96">
              <h3 className="font-semibold mb-2">Contactos ({contacts.length})</h3>
              <ul>
                {contacts.map(contact => (
                  <li
                    key={contact.id}
                    className={`p-2 cursor-pointer rounded ${selectedContact?.id === contact.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-600">{contact.phone}</div>
                    {contact.numero_ticket && (
                      <div className="text-xs text-gray-500">Ticket: {contact.numero_ticket}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={`border rounded p-2 ${activeTab === 'individual' ? 'md:col-span-2' : 'md:col-span-3'}`}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Plantillas de mensaje:</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    applyTemplate(e.target.value);
                  }
                }}
              >
                <option value="">Seleccionar plantilla</option>
                {templates.map((template, index) => (
                  <option key={index} value={template}>
                    {template.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Mensaje: {activeTab === 'bulk' && '(Puedes usar {nombre}, {ticket}, {cedula}, {estado} como marcadores)'}
              </label>
              <textarea
                className="w-full p-2 border rounded h-40"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
            
            {enableAttachments && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Adjuntos (URLs):</label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    className="flex-grow p-2 border rounded-l"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://ejemplo.com/archivo.pdf"
                  />
                  <button
                    className="bg-blue-500 text-white px-4 rounded-r"
                    onClick={addAttachment}
                  >
                    Agregar
                  </button>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Adjuntos actuales:</p>
                    <ul className="mt-1">
                      {attachments.map((url, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline mr-2 truncate"
                          >
                            {url}
                          </a>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeAttachment(url)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              {activeTab === 'individual' ? (
                <button
                  className={`px-4 py-2 rounded ${messageSending ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  onClick={sendMessage}
                  disabled={messageSending || !selectedContact}
                >
                  {messageSending ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              ) : (
                <button
                  className={`px-4 py-2 rounded ${messageSending ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  onClick={sendBulkMessages}
                  disabled={messageSending}
                >
                  {messageSending ? 'Enviando...' : `Enviar a ${contacts.length} contactos`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingModal; 