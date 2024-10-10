import React, { useState } from 'react';
import { joinRoom } from '@/services/api/apiRoom';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
export default function StudentDashboard() {
  const [classCode, setClassCode] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate()

  // Handler for the form submission
  const handleJoinClass = async (event: React.FormEvent) => {
    event.preventDefault();
    // Add logic to handle joining the class using classCode
    const studentId = user ? user.id : null;
    const name = user ? user.name : "";
    const success = await joinRoom(classCode, studentId!, name);
    if (success){      
      navigate('/student/join/9f945506-f7a8-483c-97d9-b237d0b2a5bd/gamelobby')
    }
    
    setClassCode(''); 
  };

  return (
    <div style={styles.container}>
      <h1>Student Dashboard</h1>
      <form onSubmit={handleJoinClass} style={styles.form}>
        <input
          type="text"
          placeholder="Enter Class Code"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Join
        </button>
      </form>
    </div>
  );
}

// Styles for the component
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    fontSize: '16px',
    width: '200px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
  },
};
