
import supabase from '../../utils/supabase';

// Function to check if user exists and insert if not (for OAuth)
export const handleOAuthSignup = async (session : any) => {
  const user = session.user;
  const userId = user.id;

  try {
    // Check if the user already exists in the 'students' table
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      throw new Error('Error fetching user profile.');
    }

    // If no record is found, insert the user into the 'students' table
    if (!data) {
      console.log('Inserting new user into students table...');
      const { error: insertError } = await supabase
        .from('students')
        .insert([{ id: userId }]);

      if (insertError) {
        console.error('Failed to create student profile:', insertError);
        throw new Error('Failed to create student profile: ' + insertError.message);
      }
    }
  } catch (e) {
    console.error('Unexpected error during OAuth signup:', e);
    throw e; // Re-throw the error for handling in the calling function
  }
};

