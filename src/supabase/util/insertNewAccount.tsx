import supabase from '../../../utils/supabase';

export const insertNewAccount = async (userId: string, userEmail: string, table: string): Promise<void> => {
    const { error: insertError } = await supabase
      .from(table)
      .insert([{ id: userId, email: userEmail }]);

    if (insertError) {
      console.error('Failed to create student profile:', insertError);
      throw new Error('Failed to create student profile: ' + insertError.message);
    }
  };