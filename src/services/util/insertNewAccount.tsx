import supabase from "../supabase";

export const insertNewAccount = async (
  userId: string,
  userEmail: string,  
): Promise<void> => {
  const { error: insertError } = await supabase
    .from("user")
    .insert([{ auth_id: userId, email: userEmail }]);

  if (insertError) {
    console.error("Failed to create student profile:", insertError);
    throw new Error("Failed to create student profile: " + insertError.message);
  }
};
