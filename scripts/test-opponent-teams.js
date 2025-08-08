// Test script to verify opponent_teams table and operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zfiqvovfhkqiucmuwykw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaXF2b3ZmaGtxaXVjbXV3eWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzg3MjEsImV4cCI6MjA2NTY1NDcyMX0.z8llCv7zZX7-D2DtySDZTI9KTsGC1O2XziRRAbrHJ1Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('Testing opponent_teams table...\n');

  // Test 1: Check if table exists and is accessible
  console.log('1. Testing table access...');
  try {
    const { data, error } = await supabase
      .from('opponent_teams')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table access error:', error);
      console.log('\nTable might not exist. Please run the create table SQL script first.');
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    console.log('Current teams count:', data?.length || 0);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return;
  }

  // Test 2: Test insert operation
  console.log('\n2. Testing insert operation...');
  const testTeam = {
    team_name: 'Test Team ' + Date.now(),
    short_name: 'Test',
    city: 'Test City',
    state: 'NJ',
    program_type: 'youth',
    is_free_program: false,
    primary_color: '#000000',
    secondary_color: '#FFFFFF'
  };

  try {
    const { data, error } = await supabase
      .from('opponent_teams')
      .insert([testTeam])
      .select();
    
    if (error) {
      console.error('❌ Insert error:', error);
      console.log('\nPossible issues:');
      console.log('- Table might not have proper permissions');
      console.log('- Required fields might be missing');
      console.log('- RLS policies might be blocking the operation');
    } else {
      console.log('✅ Insert successful');
      console.log('Created team:', data[0]);
      
      // Test 3: Test update operation
      if (data && data[0]) {
        console.log('\n3. Testing update operation...');
        const { data: updateData, error: updateError } = await supabase
          .from('opponent_teams')
          .update({ notes: 'Updated at ' + new Date().toISOString() })
          .eq('id', data[0].id)
          .select();
        
        if (updateError) {
          console.error('❌ Update error:', updateError);
        } else {
          console.log('✅ Update successful');
        }
        
        // Test 4: Test delete operation
        console.log('\n4. Testing delete operation...');
        const { error: deleteError } = await supabase
          .from('opponent_teams')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.error('❌ Delete error:', deleteError);
        } else {
          console.log('✅ Delete successful');
        }
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error during operations:', err);
  }

  console.log('\n✅ All tests completed!');
  console.log('\nIf you see any errors above, please:');
  console.log('1. Make sure the table is created using the SQL script');
  console.log('2. Check that RLS policies are properly configured');
  console.log('3. Verify your Supabase credentials are correct');
}

testDatabase();