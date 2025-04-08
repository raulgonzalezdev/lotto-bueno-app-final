/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import { detectHost } from "../../api";
import Toast from '../toast/Toast'; // Importar componente Toast
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "../../hooks/useUsers";

interface User {
  id: number;
  username: string;
  email: string;
  hashed_password?: string; // Hacerlo opcional para que coincida con la definición en useUsers
  created_at: string;
  updated_at: string;
  isAdmin: boolean;
}

const UserControl: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", isAdmin: false });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [APIHost, setAPIHost] = useState<string | null>(null);

  // Usar los hooks de React Query
  const { data: usersData, isLoading: usersLoading } = useUsers({
    currentPage,
    usersPerPage,
    searchTerm
  });

  // Mutaciones
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    fetchHost();
  }, []);

  useEffect(() => {
    if (usersData) {
      setTotalPages(Math.ceil(usersData.total / usersPerPage));
    }
  }, [usersData, usersPerPage]);

  const fetchHost = async () => {
    try {
      const host = await detectHost();
      setAPIHost(host);
    } catch (error) {
      console.error("Error detecting host:", error);
      setAPIHost(process.env.NEXT_PUBLIC_API_URL || 'https://applottobueno.com');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUserMutation.mutateAsync(id, {
        onSuccess: () => {
          setToastMessage("Usuario eliminado exitosamente");
          setToastType("success");
        },
        onError: (error) => {
          setToastMessage("Error eliminando usuario: " + error.message);
          setToastType("error");
        }
      });
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setToastMessage("Error eliminando usuario. Por favor, intenta de nuevo.");
      setToastType("error");
    }
  };

  const handleCreate = async () => {
    try {
      await createUserMutation.mutateAsync(newUser, {
        onSuccess: () => {
          setNewUser({ username: "", email: "", password: "", isAdmin: false });
          closeModal();
          setToastMessage("Usuario creado exitosamente");
          setToastType("success");
        },
        onError: (error) => {
          setToastMessage("Error creando usuario: " + error.message);
          setToastType("error");
        }
      });
    } catch (error) {
      console.error("Error creando usuario:", error);
      setToastMessage("Error creando usuario. Por favor, intenta de nuevo.");
      setToastType("error");
    }
  };

  const handleUpdate = async (user: User) => {
    if (!user) return;
    
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        payload: {
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        }
      }, {
        onSuccess: () => {
          closeModal();
          setToastMessage("Usuario actualizado exitosamente");
          setToastType("success");
        },
        onError: (error) => {
          setToastMessage("Error actualizando usuario: " + error.message);
          setToastType("error");
        }
      });
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      setToastMessage("Error actualizando usuario. Por favor, intenta de nuevo.");
      setToastType("error");
    }
  };

  const openModal = (user: User | null = null) => {
    setSelectedUser(user);
    setIsEditing(!!user);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) {
      setCurrentPage(1);
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  // Obtener la lista de usuarios
  const users = usersData?.items || [];

  return (
    <div className="p-4">
      <h2>Control de Usuarios</h2>
      <button onClick={() => openModal()} className="btn btn-primary mb-4">Create New User</button>
      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="input input-bordered mb-4"
      />
      <div className="pagination mb-4 flex justify-center">
        <button onClick={() => paginate(1)} className="btn btn-primary mr-1">{"<<"}</button>
        <button onClick={() => paginate(currentPage - 1)} className="btn btn-primary mr-1">{"<"}</button>
        <span className="btn btn-disabled mr-1">Página {currentPage} de {totalPages}</span>
        <button onClick={() => paginate(currentPage + 1)} className="btn btn-primary mr-1">{">"}</button>
        <button onClick={() => paginate(totalPages)} className="btn btn-primary">{">>"}</button>
      </div>

      {usersLoading ? (
        <div className="text-center py-4">Cargando usuarios...</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Created_at</th>
              <th>Updated_at</th>
              <th>isAdmin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.created_at}</td>
                  <td>{user.updated_at}</td>
                  <td>{user.isAdmin ? "Yes" : "No"}</td>
                  <td>
                    <button 
                      className="btn btn-primary mr-2" 
                      onClick={() => openModal(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">No hay usuarios disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalIsOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>×</button>
            <h2>{isEditing ? "Edit User" : "Create User"}</h2>
            <input
              type="text"
              placeholder="Username"
              value={isEditing && selectedUser ? selectedUser.username : newUser.username}
              onChange={(e) => {
                if (isEditing && selectedUser) {
                  setSelectedUser({ ...selectedUser, username: e.target.value });
                } else {
                  setNewUser({ ...newUser, username: e.target.value });
                }
              }}
              className="input input-bordered w-full mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={isEditing && selectedUser ? selectedUser.email : newUser.email}
              onChange={(e) => {
                if (isEditing && selectedUser) {
                  setSelectedUser({ ...selectedUser, email: e.target.value });
                } else {
                  setNewUser({ ...newUser, email: e.target.value });
                }
              }}
              className="input input-bordered w-full mb-2"
            />
            {!isEditing && (
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="input input-bordered w-full mb-2"
              />
            )}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={isEditing && selectedUser ? selectedUser.isAdmin : newUser.isAdmin}
                onChange={(e) => {
                  if (isEditing && selectedUser) {
                    setSelectedUser({ ...selectedUser, isAdmin: e.target.checked });
                  } else {
                    setNewUser({ ...newUser, isAdmin: e.target.checked });
                  }
                }}
              />
              Es Admin
            </label>
            <button 
              onClick={isEditing && selectedUser ? () => handleUpdate(selectedUser) : handleCreate} 
              className="btn btn-primary"
              disabled={isEditing ? updateUserMutation.isPending : createUserMutation.isPending}
            >
              {isEditing 
                ? (updateUserMutation.isPending ? "Actualizando..." : "Update User") 
                : (createUserMutation.isPending ? "Creando..." : "Create User")
              }
            </button>
          </div>
        </div>
      )}
      {toastMessage && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default UserControl;
