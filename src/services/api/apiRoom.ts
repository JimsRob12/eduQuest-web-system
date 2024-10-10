
import { send } from "process";
import supabase from "../supabase";

// Function to start the game and notify all subscribers
export async function startGame(classCode: string) {

    const { data, error: updateError } = await supabase
        .from('quiz')
        .update({ status: 'in game' })
        .eq('class_code', classCode)
        .select()
    
    if (updateError) {
        console.error('Error updating quiz status:', updateError);
        return;
    } 
    
    
    const channel = supabase.channel('room1');
    
    channel.send({
        type: 'broadcast',
        event: 'quiz-game-started',
        payload: { classCode }, 
    });
    channel.unsubscribe()
    console.log(`Game started for quiz ID: ${classCode}`);
}

export async function reconnectGame(classCode: string) {

    const { data, error } = await supabase
        .from('quiz')
        .select('status')
        .eq('class_code', classCode)
        .single();

    if (error) {
        console.error("Error checking quiz status:", error);
        return false;
    }

    return data?.status === 'in game';
}

export async function endGame(classCode: string) {
    const { data, error } = await supabase
        .from("temp_room")
        .delete()
        .eq('class_code', classCode);

    if (error) {
        console.error("Game not ended:", error);
        return false;
    }

    console.log("Game Ended:", data);
    return true;
}

export async function getParticipants(classCode: string, setStudents:any) {
    const { data: initialParticipants, error } = await supabase
        .from('temp_room')
        .select('*')
        .eq('class_code', classCode);

      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }

      // Map the initial participants into the correct format
      const formattedParticipants = initialParticipants.map((student) => ({
        placement: 0,
        quiz_student_id: student.quiz_student_id,
        right_answer: 0,
        score: 0,
        student_name: student.student_name,
        wrong_answer: 0,
      }));

      setStudents(formattedParticipants);

    supabase
    .channel('schema-db-changes')
    .on(
    'postgres_changes',
    {
        event: 'INSERT',
        schema: 'public',
        table: "temp_room"
    },
        (payload) => {
            const newStudent = {
                placement: 0,
                quiz_student_id: payload.new.quiz_student_id,
                right_answer: 0,
                score: 0,
                student_name: payload.new.student_name,
                wrong_answer: 0,
            };
          
            if (classCode === payload.new.class_code) {
                setStudents((prevStudent) => [...prevStudent, newStudent])
                
              
                            
            }   
        }
    )
    .subscribe()

}

export async function joinRoom(classCode :string, studentId:string, name: string) {
    
    const { data: existingRecord, error: fetchError } = await supabase
    .from("temp_room")
    .select("*")
    .match({
        quiz_student_id: studentId,
        class_code: classCode,
      })
    .single();

    if (fetchError && fetchError.code !== "PGRST116") {
       
        console.error("Error checking quiz existence:", fetchError);
        return false;
    }

    if (existingRecord) {
       
        console.log("Record already exists:", existingRecord);
        return true;
    }
  const { data, error } = await supabase
      .from("temp_room")
      .insert({
        quiz_student_id: studentId,
        class_code: classCode,
        student_name: name,
      })
      .select()
      .single();

  if (error) {
      console.error("Error creating quiz:", error);
      return false;
  }

  console.log("Quiz created:", data);
  // success join
  return true
}

export async function leaveRoom(classCode: string, studentId: string) {
    const { data, error } = await supabase
      .from("temp_room")
      .delete()
      .match({
        quiz_student_id: studentId,
        class_code: classCode,
      });
  
    if (error) {
      console.error("Error leaving the room:", error);
      return false;
    }
  
    console.log("Successfully left the room:", data);
    return true;
}

export async function gameEventHandler(classCode:string, setGameStart: (value: boolean) => void) {
    
    const channel = supabase.channel(`room1`)
        .on('broadcast', { event: 'quiz-game-started' }, (payload) => {
            console.log('Game started event received:', payload);
            setGameStart(true);
        })
        .subscribe();

  
    return () => channel.unsubscribe();
}

export async function getQuestionsProf(classCode: string) {
   
    const { data: quizData, error: quizError } = await supabase
      .from("quiz")
      .select("quiz_id")
      .eq("class_code", classCode)
      .single();
  
    if (quizError) {
      console.error("Error fetching quiz ID:", quizError);
      return [];
    }
  
    const quizId = quizData.quiz_id;
     
    const { data: questionsData, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("quiz_question_id, right_answer, question, distractor, time, image_url, points, question_type, order")
      .eq("quiz_id", quizId)
      .order("order", { ascending: true });
  
    if (questionsError) {
      console.error("Error fetching quiz questions:", questionsError);
      return [];
    }

    // send first q
    sendNextQuestion(questionsData[0].quiz_question_id,
        questionsData[0].question, questionsData[0].distractor,
        questionsData[0].time, questionsData[0].image_url,
        questionsData[0].points, questionsData[0].question_type,
        questionsData[0].order, classCode
    )
    console.log("Quiz questions retrieved:", questionsData);
    return questionsData;
}

export async function sendNextQuestion(quiz_question_id, question, 
    distractor, time, image_url, points, question_type, order, classCode) {
          
    const { data: existingQuestions, error: fetchError } = await supabase
        .from('temp_room_questions')
        .select('quiz_question_id, id')
        .eq('class_code', classCode)
        .single();
    
    if (fetchError) {
        console.error("Error fetching questions from temp_room_questions:", fetchError);        
    }
    
    
    
    if (existingQuestions) {
        
        const { error: updateError } = await supabase
            .from('temp_room_questions')
            .update({
                quiz_question_id: quiz_question_id,
                question: question,
                distractor: distractor,
                time: time,
                image_url: image_url,
                points: points,
                question_type: question_type,
                order: order
            })
            .eq('id', existingQuestions.id);
    
        if (updateError) {
            console.error("Error updating question in temp_room_questions:", updateError);
            return false;
        }

        console.log(`Updated question for class code ${classCode}.`);
    } else {
        
        const { error: insertError } = await supabase
            .from('temp_room_questions')
            .insert([{
                quiz_question_id: quiz_question_id,
                class_code: classCode,
                question: question,
                distractor: distractor,
                time: time,
                image_url: image_url,
                points: points,
                question_type: question_type,
                order: order
            }]);
    
        if (insertError) {
            console.error("Error inserting question into temp_room_questions:", insertError);
            return false;
        }
    
        console.log("Question inserted successfully into temp_room_questions");
    }
    
    return true;
    
}

export async function sendTimer(classCode, time) {
    const channel = supabase.channel('room1');

    await channel.send({
        type: 'broadcast',
        event: 'timer-started',
        payload: { classCode, startTime: new Date().toISOString(), duration: time },
      });
}

export async function getTimer(setTimeLeft) {

    const channel = supabase.channel(`room1`)
    .on('broadcast', { event: 'timer-started' }, (payload) => {
        console.log('Game started event received:', payload.payload);
              
        const { startTime, duration } = payload.payload;        
        const startTimeDate = new Date(startTime);        
        const currentTime = new Date();        
        const elapsedTime = Math.floor((currentTime - startTimeDate) / 1000);         
        const remainingTime = duration - elapsedTime;           
        setTimeLeft(Math.max(remainingTime, 0));
    })
    .subscribe();


    return () => channel.unsubscribe();
}

export async function sendEndGame(classCode) {
    const channel = supabase.channel('room1');
    
    channel.send({
        type: 'broadcast',
        event: 'quiz-game-ended',
        payload: { classCode }, 
    });
    channel.unsubscribe()
}
 
export async function sendShowLeaderboard(classCode) {
    const channel = supabase.channel('room1');
    
    channel.send({
        type: 'broadcast',
        event: 'quiz-game-leaderboard',
        payload: { classCode }, 
    });
    channel.unsubscribe()
}

export async function getEndGame(setGameStart) {
    const channel = supabase.channel(`room1`)
    .on('broadcast', { event: 'quiz-game-ended' }, (payload) => {
        console.log('Game started event received:', payload);
        setGameStart(false);
    })
    .subscribe();


    return () => channel.unsubscribe();
}
 
export async function getShowLeaderboard(setLeaderBoard) {
    const channel = supabase.channel(`room1`)
        .on('broadcast', { event: 'quiz-game-leaderboard' }, (payload) => {
            console.log('Game started event received:', payload);
            setLeaderBoard(true);
        })
        .subscribe();

  
    return () => channel.unsubscribe();
}

export async function getQuizQuestionsStud(classCode: string) {
    return new Promise((resolve, reject) => {
        let question = [];

        // Create the Supabase channel
        supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: "temp_room_questions"
                },
                (payload) => {
                    // Build the new question object from the payload
                    const newQuestion = {
                        quiz_question_id: payload.new.quiz_question_id,
                        class_code: classCode,
                        question: payload.new.question,
                        distractor: payload.new.distractor,
                        time: payload.new.time,
                        image_url: payload.new.image_url,
                        points: payload.new.points,
                        question_type: payload.new.question_type,
                        order: payload.new.order                
                    };

                    // Check if the class_code matches
                    if (classCode === payload.new.class_code) {
                        question = [newQuestion];
                        console.log("Question received: ", newQuestion);
                        resolve(question); // Resolve the promise with the question array
                    }
                }
            )
            .subscribe();
    });
}

    // const { data: initialQuestion, error } = await supabase
    //     .from('temp_room_questions')
    //     .select('*')
    //     .eq('class_code', classCode)
    //     .order('order', { ascending: true }); 

    // if (error) {
    //     console.error('Error fetching questions:', error);
    //     return;
    // }
        
    // const question = initialQuestion.map((question) => ({
    //     quiz_question_id: question.quiz_question_id,
    //     class_code: question.class_code,
    //     question: question.question,
    //     distractor: question.distractor,
    //     time: question.time,
    //     image_url: question.image_url,
    //     points: question.points,
    //     question_type: question.question_type,
    //     order: question.order,
    // }));


async function checkAnswer(questionId: string, 
    answer: string): Promise<boolean> {    
    const { error, count } = await supabase
        .from("quiz_questions")
        .select("quiz_question_id", { count: 'exact' }) 
        .eq("quiz_question_id", questionId)
        .eq("right_answer", answer) 
        .single(); 

    if (error) {
        console.error("Error fetching question:", error);
        return false; 
    }
    
    return count ? count > 0 : false; 
}

export async function updateLeaderBoard(classCode: string, 
    studentId: string, studentName: string, score: number, 
    rightAns: number, wrongAns: number) {
    

    const { data: existingStudent, error: studentError } = await supabase
        .from("quiz_students")
        .select("quiz_student_id, score")
        .match({
            "quiz_student_id": studentId,
            "class_code": classCode
        })
        .single();

    if (studentError && studentError.code !== 'PGRST116') {
        console.error("Error checking student existence:", studentError);
        return;
    }
        
    if (!existingStudent) {        
        const { error: insertError } = await supabase
            .from("quiz_students")
            .insert([{ 
                quiz_student_id: studentId, 
                student_name: studentName, 
                score : score, 
                class_code: classCode 
            }]);

        if (insertError) {
            console.error("Error inserting new student:", insertError);
            return;
        }

        console.log("New student added:", studentId);
    } else {
       
        const { error: updateError } = await supabase
            .from("quiz_students")
            .update({ 
                score: score, 
                right_answer: rightAns,
                wrong_answer: wrongAns
            })
            .match({
                "quiz_student_id": studentId,
                "class_code" : classCode                
            });

        if (updateError) {
            console.error("Error updating student score:", updateError);
            return;
        }

        console.log("Student score updated:", studentId);
    }
   
    const { data: allStudents, error: leaderboardError } = await supabase
        .from("quiz_students")
        .select("quiz_student_id, score, id, right_answer, wrong_answer, student_name")
        .eq("class_code", classCode)
        .order("score", { ascending: false });

    if (leaderboardError) {
        console.error("Error fetching leaderboard:", leaderboardError);
        return;
    }
   
    const updates = allStudents.map((student, index) => ({
        id: student.id,
        quiz_student_id: student.quiz_student_id,
        placement: index + 1
    }));
   
    const { error: placementError } = await supabase
        .from("quiz_students")
        .upsert(updates);

    if (placementError) {
        console.error("Error updating placements:", placementError);
        return;
    }

    console.log("Leaderboard updated successfully.");

    return allStudents

}


export async function submitAnswer(questionId:string, 
    studentId:string, answer:string) {
    
    
    const isCorrect = await checkAnswer(questionId, 
        answer)
    console.log(isCorrect);
    
    return isCorrect
}

