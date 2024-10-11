import React, {useState, useEffect} from 'react';
import { 
    getParticipants, 
    leaveRoom, 
    gameEventHandler, 
    getQuizQuestionsStud,
    updateLeaderBoard,
    reconnectGame,    
    getEndGame,
    getExitLeaderboard,
    submitAnswer } from '@/services/api/apiRoom';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';


// GameLobby component
const SGameLobby: React.FC = () => {
    const {user} = useAuth()
    const [students, setStudents] = useState([]);
    const [gameStart, setGameStart] = useState(false)
    
    const [score, setScore] = useState(0)
    const [rightAns, setRightAns] = useState(0)
    const [wrongAns, setWrongAns] = useState(0)

    const [questions, setQuestions] =useState()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5); 
    const [leaderBoard, setLeaderBoard] = useState(false)
    const navigate = useNavigate()
    const classCode = '9f945506-f7a8-483c-97d9-b237d0b2a5bd';

    
    useEffect(() => {
        const fetchParticipants = async () => {
          
            await getParticipants(classCode, setStudents);            
        };

        fetchParticipants();

        const checkGameStatus = async () => {
            await gameEventHandler(classCode, setGameStart)

            // const reconnect = await reconnectGame(classCode)
            // console.log(reconnect);
            
            // if (reconnect) setGameStart(true)
        };
        checkGameStatus()
                                                                               
    }, [classCode]);

        
    useEffect(() => {    
        
        const getQuestion = async () => {
            if (gameStart) {
                const question = await getQuizQuestionsStud(classCode, setTimeLeft);                                
                setQuestions(question)                            
                
            }           
        }
        getQuestion()
            
    }, [gameStart]);

    
    const handleNextQuestion = async () => {                
            
        await getEndGame(setGameStart)

        setCurrentQuestionIndex(currentQuestionIndex + 1);            
        const question = await getQuizQuestionsStud(classCode, setTimeLeft);
        console.log(question);
              
        setQuestions(question)                         
    };
    useEffect(() => {  
                   
        if (gameStart && timeLeft >= 0) {            
            const interval = setInterval(() => {
                setTimeLeft((prevTime) => Math.max(prevTime - 1, 0)); 
                }, 1000);
                
            if (timeLeft <= 0) {
                setLeaderBoard(true)
                
                setTimeout(() => {         
                    getExitLeaderboard(setLeaderBoard);                        
                    handleNextQuestion();
                    
                }, 10000); 
                

            }
            return () => {
                clearInterval(interval);
            }
        }
      
       
                 
    }, [timeLeft, gameStart]);        

    const leaveHandler = () => {
        const response = leaveRoom(classCode, user?.id)

        if (!response) alert("cant leave the game")

        navigate("/student/dashboard")
    }

    const handleAnswer = async (questionId:string, 
        studentId:string, answer:string, qScore:number) => {
        
        const response = await submitAnswer(questionId, studentId, answer)
        
        if (!response) {
            setWrongAns(prev => prev+1)
            return;   
        }
        setScore(prev => prev + qScore)
        setRightAns(prev => prev+1)
                        
    }
    useEffect(() => {
        const getQuestions = async () => {
            if(rightAns !== 0 && wrongAns !== 0 &&score !== 0) {
                const updatedLeaderBoard = await updateLeaderBoard(classCode, user?.id, user?.name,score, 
                    rightAns, wrongAns)            
                console.log(updatedLeaderBoard);
            }                                        
        }
        getQuestions()
        
    }, [rightAns, wrongAns, score]);
    return (
        leaderBoard  ? ( <>
            <h1>LeaderBoard</h1>
            </>) : (
        !gameStart ? (
            <div style={styles.container}>
            <div style={styles.header}>
                <h1>Game Lobby</h1>
                <button style={styles.startButton} onClick={leaveHandler}>
                    Leave Game
                </button>
            </div>
            <div style={styles.studentList}>
                {students.length > 0 ? (
                    students.map((student, index) => (
                    <div key={index} style={styles.studentItem}>
                        {student.student_name}
                    </div>
                    ))
                ) : (
                    <div>No students currently joined.</div>
                )}
            </div>
        </div>
        ) : (
            questions &&
            <div>
                <h1>Question {currentQuestionIndex + 1}</h1>
                <div style={styles.question}>
                    <h2>{questions.question}</h2>
                    <div style={styles.choices}>
                        {questions.distractor.map((choice, index) => (
                            <button 
                                onClick={() => 
                                    handleAnswer(questions.quiz_question_id, 
                                    user?.id,
                                    choice,
                                    questions.points
                                )}
                                key={index} 
                                className='bg-blue-500 m-2 p-2 text-white
                                 hover:bg-blue-600'>
                                {choice}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={styles.timer}>
                    Time Left: {timeLeft} seconds
                </div>
            </div>
        )
    )
    );
};

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
    header: {
        marginBottom: '20px',
    },
    startButton: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        background: "#9400d3",
        color:"white",
    },
    studentList: {
        borderTop: '1px solid #ccc',
        paddingTop: '10px',
        width: '100%',
        maxWidth: '400px',
    },
    studentItem: {
        padding: '10px',
        borderBottom: '1px solid #eee',
    },
};

export default SGameLobby;
