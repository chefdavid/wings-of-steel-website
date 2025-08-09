// Verify the actual days of the week for the schedule
const scheduleData = `9/4/25 Thu
9/18/25 Thu
9/25/25 Thu
10/2/25 Thu
10/9/25 Thu
10/18/25 Sat
10/19/25 Sun
10/23/25 Thu
10/30/25 Thu
11/6/25 Thu
11/13/25 Thu
11/16/25 Sun
11/20/25 Thu
11/29/25 Sat
12/4/25 Thu
12/11/25 Thu
12/18/25 Thu
12/21/25 Sun
1/8/26 Thu
1/15/26 Thu
1/22/26 Thu
1/29/26 Thu
2/5/26 Thu
2/12/26 Thu
2/15/26 Sun
2/19/26 Thu
2/21/26 Sat
2/26/26 Thu
2/28/26 Sat
3/1/26 Sun
3/5/26 Thu
3/12/26 Thu
3/19/26 Thu
3/22/26 Sun
3/26/26 Thu
4/2/26 Thu
4/9/26 Thu
4/16/26 Thu
4/23/26 Thu
4/30/26 Thu`;

console.log('Checking actual days of week for dates:\n');

scheduleData.split('\n').forEach(line => {
  const [dateStr, expectedDay] = line.split(' ');
  const [m, d, y] = dateStr.split('/');
  
  // Create date in UTC to avoid timezone issues
  const year = parseInt('20' + y);
  const month = parseInt(m) - 1; // JavaScript months are 0-based
  const day = parseInt(d);
  
  const date = new Date(Date.UTC(year, month, day));
  const actualDay = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  
  const sqlDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const match = actualDay === expectedDay ? '✓' : '✗ MISMATCH';
  console.log(`${dateStr} (${expectedDay}) => ${sqlDate} (${actualDay}) ${match}`);
});