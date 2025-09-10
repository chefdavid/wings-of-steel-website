// Script to verify that all dates in the schedule have the correct day of week
import { schedule2025_2026 } from '../data/schedule-2025-2026';

function verifyDates() {
  console.log('Verifying 2025-2026 Schedule Dates...\n');
  
  const expectedDays: { [key: string]: string } = {
    '2025-10-05': 'Sunday',
    '2025-10-11': 'Saturday',
    '2025-10-18': 'Saturday',
    '2025-10-19': 'Sunday',
    '2025-11-16': 'Sunday',
    '2025-11-29': 'Saturday',
    '2025-12-21': 'Sunday',
    '2026-01-11': 'Sunday',
    '2026-01-31': 'Saturday',
    '2026-02-07': 'Saturday',
    '2026-02-15': 'Sunday',
    '2026-02-21': 'Saturday',
    '2026-02-28': 'Saturday',
    '2026-03-01': 'Sunday',
    '2026-03-22': 'Sunday'
  };
  
  let allCorrect = true;
  
  schedule2025_2026.forEach(game => {
    const date = new Date(game.game_date + 'T12:00:00'); // Use noon to avoid timezone issues
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const expectedDay = expectedDays[game.game_date];
    
    const timeFormatted = formatTime(game.game_time);
    const isCorrect = !expectedDay || dayOfWeek === expectedDay;
    
    if (!isCorrect) {
      allCorrect = false;
      console.log(`❌ ${game.game_date} (${dayOfWeek}) - Expected ${expectedDay}`);
      console.log(`   ${timeFormatted} vs ${game.opponent} at ${game.location}`);
    } else {
      console.log(`✅ ${game.game_date} (${dayOfWeek}) ${timeFormatted}`);
      console.log(`   vs ${game.opponent} ${game.home_away === 'home' ? '(HOME)' : '(AWAY)'}`);
    }
    console.log('');
  });
  
  if (allCorrect) {
    console.log('✅ All dates have the correct day of the week!');
  } else {
    console.log('❌ Some dates have incorrect days of the week');
  }
  
  // Summary
  console.log('\n=== Schedule Summary ===');
  console.log(`Total games: ${schedule2025_2026.length}`);
  console.log(`Home games: ${schedule2025_2026.filter(g => g.home_away === 'home').length}`);
  console.log(`Away games: ${schedule2025_2026.filter(g => g.home_away === 'away').length}`);
  
  // Games by month
  const gamesByMonth: { [key: string]: number } = {};
  schedule2025_2026.forEach(game => {
    const month = game.game_date.substring(0, 7);
    gamesByMonth[month] = (gamesByMonth[month] || 0) + 1;
  });
  
  console.log('\nGames by month:');
  Object.entries(gamesByMonth).forEach(([month, count]) => {
    const monthName = new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    console.log(`  ${monthName}: ${count} games`);
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Run verification
verifyDates();