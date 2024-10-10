import React, {useState, useEffect} from 'react';
import { 
    getParticipants, 
    startGame, 
    gameEventHandler,
    getTimer,
    getQuestionsProf,
    sendNextQuestion,
    sendEndGame,
    sendShowLeaderboard, 
    sendTimer} from '@/services/api/apiRoom';


export const GameLobby: React.FC = () => {
    const [students, setStudents] = useState([]);
    const [gameStart, setGameStart] = useState(false)
    const [questions, setQuestions] =useState()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);         
    const classCode = '9f945506-f7a8-483c-97d9-b237d0b2a5bd';
    const [leaderBoard, setLeaderBoard] = useState(false)
    useEffect(() => {
        const fetchParticipants = async () => {
           
            await getParticipants(classCode, setStudents);
            console.log(students);    
        };

        fetchParticipants();

        const checkGameStatus = async () => {
            await gameEventHandler(classCode, setGameStart)
           
        };
        checkGameStatus()                            
    }, [classCode]);
    
    useEffect(() => {        
        const getQuestions = async () => {
            if (gameStart) {
                const questions = await getQuestionsProf(classCode);
                setQuestions(questions)
                setTimeLeft(questions[0].time)                
            }           
        }
        getQuestions()
            
    }, [gameStart]);

    const handleNextQuestion = async () => {                
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            const index = currentQuestionIndex + 1            
            sendNextQuestion(questions[index].quiz_question_id,
                questions[index].question, questions[index].distractor,
                questions[index].time, questions[index].image_url,
                questions[index].points, questions[index].question_type,
                questions[index].order, classCode
            )
            sendTimer(classCode,questions[currentQuestionIndex].time) 
        } else {
            
            sendEndGame(classCode)
            setGameStart(false);            
        }
    };

    useEffect(() => {  
        const startTimer = async () => {                        
            await getTimer(setTimeLeft)
            console.log(timeLeft);
            
         }
   
        if (gameStart && timeLeft >= 0) {            
            const interval = setInterval(() => {
                setTimeLeft((prevTime) => Math.max(prevTime - 1, 0)); 
                }, 1000);
                
            if (timeLeft <= 0) {
                sendShowLeaderboard(classCode);
                setLeaderBoard(true)
                handleNextQuestion();
                setTimeout(() => {
                    setLeaderBoard(false)
                    startTimer()                    
                }, 10000); 
            }
            return () => {
                clearInterval(interval);
            }
        }
                 
    }, [timeLeft, gameStart]);  

    

    const startHandler = () => {
        startGame(classCode)
    }
    return (
        leaderBoard  ? ( <>
        <h1>LeaderBoard</h1>
        </>) : (
        !gameStart ? (
            <div style={styles.container}>
            <div style={styles.header}>
                <h1>Game Lobby</h1>
                <button style={styles.startButton} onClick={startHandler}>
                    Start Game
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
                    <h2>{questions[currentQuestionIndex].question}</h2>
                    <div style={styles.choices}>
                        {questions[currentQuestionIndex].distractor.map((choice, index) => (
                            <button key={index} style={styles.choiceButton}>
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

