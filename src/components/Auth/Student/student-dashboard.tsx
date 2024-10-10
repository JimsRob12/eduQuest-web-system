import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getClassById } from "@/services/api/apiClass";

// eto api
import { joinRoom } from "@/services/api/apiRoom";

const AnimalIconInput = () => {
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const {
    data: classData,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["class", classCode],
    queryFn: () => getClassById(classCode),
    enabled: false, // This prevents the query from running automatically
  });

  // eto yung code pre 
  // const handleJoinClass = async (event: React.FormEvent) => {
  //   event.preventDefault();
  //   // Add logic to handle joining the class using classCode
  //   const studentId = user ? user.id : null;
  //   const name = user ? user.name : "";
  //   const success = await joinRoom(classCode, studentId!, name);
  //   if (success){      
  //     navigate('/student/join/9f945506-f7a8-483c-97d9-b237d0b2a5bd/gamelobby')
  //   }
    
  //   setClassCode(''); 
  // };

  const handleJoin = async () => {
    if (classCode.length < 36) {
      alert("Please enter a valid class code (36 characters)");
      return;
    }

    setIsJoining(true);
    try {
      await refetch();
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex h-[calc(100%-10rem)] flex-col items-center justify-center">
      <div className="text-purple-500">
        {isJoining ? (
          <Loader2 size={120} className="mb-8 animate-spin" />
        ) : isError ? (
          <img
            src="/cat-error.gif"
            className="mb-4 w-32"
            style={{
              transform: "scale(-1, 1)",
            }}
          />
        ) : (
          <img
            src="/cat-join.gif"
            className="-mb-4 w-32 animate-bounce"
            style={{
              transform: "scale(-1, 1)",
            }}
          />
        )}
      </div>
      <div className="text-center">
        <h1 className="mb-6 text-3xl font-bold text-purple-500">
          Join Quiz <span className="w-64"></span>
        </h1>
        {classData && (
          <p className="my-2 text-green-500">Successfully joined the class!</p>
        )}
        {isError && (
          <p className="my-2 text-red-500">
            Error: {error?.message || "Failed to join class"}
          </p>
        )}
      </div>
      <div className="relative flex space-x-2">
        <Input
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          placeholder="Enter class code"
          className="w-64"
        />

        <Button onClick={handleJoin} disabled={isJoining}>
          {isJoining ? "Joining..." : "Join"}
        </Button>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  return (
    <div className="flex h-[calc(100%-5rem)] items-center justify-center">
      <AnimalIconInput />
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
