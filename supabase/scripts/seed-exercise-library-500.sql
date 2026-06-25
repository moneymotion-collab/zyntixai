-- Standalone seed: 500 exercises for SQL Editor
-- Idempotent: ON CONFLICT (name) DO NOTHING.

create unique index if not exists exercises_name_key on public.exercises (name);

insert into public.exercises (
  name,
  category,
  primary_muscle,
  secondary_muscles,
  equipment,
  difficulty,
  instructions,
  tips,
  image_url,
  video_url
)
select
  v.name,
  v.category,
  v.primary_muscle,
  v.secondary_muscles,
  v.equipment,
  v.difficulty,
  v.instructions,
  v.tips,
  null::text,
  null::text
from (
  values
    (
      'Archer Push-Up',
      'Strength',
      'Chest',
      array['Triceps', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Archer Push-Up with controlled tempo, full range of motion, and stable chest engagement using bodyweight.',
      'Prioritize technique over load and scale chest volume as needed.'
    ),
    (
      'Barbell Bench Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Barbell',
      'Intermediate',
      'Keep shoulders retracted, lower the bar controlled, press explosively.',
      'Focus on full range of motion.'
    ),
    (
      'Cable Crossover',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Cable',
      'Intermediate',
      'Stand between high pulleys and bring handles together in front of the chest with controlled tension.',
      'Squeeze at the bottom and avoid shrugging the shoulders.'
    ),
    (
      'Cable Press Around',
      'Strength',
      'Chest',
      array['Core']::text[],
      'Cable',
      'Intermediate',
      'Perform Cable Press Around with controlled tempo, full range of motion, and stable chest engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Close-Grip Incline Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Barbell',
      'Intermediate',
      'Perform Close-Grip Incline Press with controlled tempo, full range of motion, and stable chest engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Decline Barbell Bench Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Barbell',
      'Intermediate',
      'On a decline bench, lower the bar to the lower chest and press back to lockout.',
      'Secure legs under the pads and avoid bouncing the bar off the chest.'
    ),
    (
      'Decline Dumbbell Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Decline Dumbbell Fly with controlled tempo, full range of motion, and stable chest engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Decline Dumbbell Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Decline Dumbbell Press with controlled tempo, full range of motion, and stable chest engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Decline Push-Up',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Decline Push-Up with controlled tempo, full range of motion, and stable chest engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Deficit Push-Up',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Deficit Push-Up with controlled tempo, full range of motion, and stable chest engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Dumbbell Bench Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Dumbbell',
      'Beginner',
      'Press dumbbells from chest level to full extension while keeping wrists stacked over elbows.',
      'Allow a natural arc and touch dumbbells lightly at the bottom.'
    ),
    (
      'Dumbbell Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Dumbbell',
      'Intermediate',
      'With a slight elbow bend, open arms wide and bring dumbbells together over the chest.',
      'Focus on stretching the chest without dropping elbows below the bench.'
    ),
    (
      'Floor Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Barbell',
      'Intermediate',
      'Lie on the floor, lower the bar until upper arms touch the ground, and press up.',
      'Pause briefly at the bottom to remove momentum.'
    ),
    (
      'Guillotine Press',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Guillotine Press with controlled tempo, full range of motion, and stable chest engagement using barbell.',
      'Prioritize technique over load and scale chest volume as needed.'
    ),
    (
      'Hammer Strength Chest Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Machine',
      'Beginner',
      'Perform Hammer Strength Chest Press with controlled tempo, full range of motion, and stable chest engagement using machine.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Hammer Strength Incline Press',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Machine',
      'Beginner',
      'Perform Hammer Strength Incline Press with controlled tempo, full range of motion, and stable chest engagement using machine.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'High Cable Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Cable',
      'Intermediate',
      'Perform High Cable Fly with controlled tempo, full range of motion, and stable chest engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Incline Barbell Bench Press',
      'Strength',
      'Chest',
      array['Shoulders', 'Triceps']::text[],
      'Barbell',
      'Intermediate',
      'Set the bench to 30-45 degrees, lower the bar to the upper chest, and press upward.',
      'Use a slightly narrower grip than flat bench to protect the shoulders.'
    ),
    (
      'Incline Cable Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Cable',
      'Intermediate',
      'Perform Incline Cable Fly with controlled tempo, full range of motion, and stable chest engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Incline Dumbbell Press',
      'Strength',
      'Chest',
      array['Shoulders', 'Triceps']::text[],
      'Dumbbell',
      'Intermediate',
      'On an incline bench, press dumbbells from shoulder height to overhead lockout.',
      'Keep elbows at roughly 45 degrees from the torso.'
    ),
    (
      'Incline Machine Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Machine',
      'Beginner',
      'Perform Incline Machine Fly with controlled tempo, full range of motion, and stable chest engagement using machine.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Isometric Chest Squeeze',
      'Strength',
      'Chest',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Isometric Chest Squeeze with controlled tempo, full range of motion, and stable chest engagement using bodyweight.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Kettlebell Crush Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Kettlebell',
      'Beginner',
      'Perform Kettlebell Crush Press with controlled tempo, full range of motion, and stable chest engagement using kettlebell.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Kettlebell Floor Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Floor Press with controlled tempo, full range of motion, and stable chest engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Landmine Press',
      'Strength',
      'Chest',
      array['Shoulders', 'Triceps']::text[],
      'Barbell',
      'Intermediate',
      'Press the end of a landmine barbell upward and slightly forward from chest level.',
      'Stand in an athletic staggered stance for balance.'
    ),
    (
      'Low to High Cable Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Cable',
      'Intermediate',
      'Start with handles low and sweep upward to eye level while squeezing the chest.',
      'Use light weight and control the eccentric phase.'
    ),
    (
      'Machine Chest Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Machine',
      'Beginner',
      'Press handles forward from chest height to full extension without locking elbows aggressively.',
      'Adjust the seat so handles align with mid-chest.'
    ),
    (
      'Machine Decline Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Machine',
      'Beginner',
      'Perform Machine Decline Press with controlled tempo, full range of motion, and stable chest engagement using machine.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Mid Cable Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Cable',
      'Beginner',
      'Perform Mid Cable Fly with controlled tempo, full range of motion, and stable chest engagement using cable.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Neutral-Grip Dumbbell Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Neutral-Grip Dumbbell Press with controlled tempo, full range of motion, and stable chest engagement using dumbbell.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Paused Bench Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Barbell',
      'Intermediate',
      'Perform Paused Bench Press with controlled tempo, full range of motion, and stable chest engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Pec Deck',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Machine',
      'Beginner',
      'Sit with elbows on pads and bring arms together in front of the chest.',
      'Use a full stretch at the start without forcing excessive range.'
    ),
    (
      'Pin Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Pin Press with controlled tempo, full range of motion, and stable chest engagement using barbell.',
      'Prioritize technique over load and scale chest volume as needed.'
    ),
    (
      'Plyometric Push-Up',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Plyometric Push-Up with controlled tempo, full range of motion, and stable chest engagement using bodyweight.',
      'Prioritize technique over load and scale chest volume as needed.'
    ),
    (
      'Push-Up',
      'Strength',
      'Chest',
      array['Triceps', 'Core']::text[],
      'Bodyweight',
      'Beginner',
      'Maintain a straight line from head to heels, lower the chest to the floor, and press back up.',
      'Keep ribs down and glutes engaged throughout the set.'
    ),
    (
      'Resistance Band Chest Press',
      'Strength',
      'Chest',
      array['Triceps']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Chest Press with controlled tempo, full range of motion, and stable chest engagement using resistance band.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Resistance Band Fly',
      'Strength',
      'Chest',
      array['Shoulders']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Fly with controlled tempo, full range of motion, and stable chest engagement using resistance band.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Ring Push-Up',
      'Strength',
      'Chest',
      array['Triceps', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Ring Push-Up with controlled tempo, full range of motion, and stable chest engagement using bodyweight.',
      'Prioritize technique over load and scale chest volume as needed.'
    ),
    (
      'Single-Arm Cable Press',
      'Strength',
      'Chest',
      array['Core', 'Triceps']::text[],
      'Cable',
      'Intermediate',
      'Perform Single-Arm Cable Press with controlled tempo, full range of motion, and stable chest engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Smith Machine Bench Press',
      'Strength',
      'Chest',
      array['Triceps', 'Shoulders']::text[],
      'Machine',
      'Beginner',
      'Perform Smith Machine Bench Press with controlled tempo, full range of motion, and stable chest engagement using machine.',
      'Start light, master form, and progress gradually on chest training.'
    ),
    (
      'Back Extension',
      'Strength',
      'Back',
      array['Glutes', 'Lower Back']::text[],
      'Machine',
      'Beginner',
      'Perform Back Extension with controlled tempo, full range of motion, and stable back engagement using machine.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Band-Assisted Pull-Up',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band-Assisted Pull-Up with controlled tempo, full range of motion, and stable back engagement using resistance band.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Barbell Bent-Over Row',
      'Strength',
      'Back',
      array['Biceps', 'Rear Delts']::text[],
      'Barbell',
      'Intermediate',
      'Hinge at the hips, keep the spine neutral, and row the bar to the lower ribs.',
      'Pull elbows back and squeeze shoulder blades at the top.'
    ),
    (
      'Barbell Deadlift',
      'Strength',
      'Back',
      array['Glutes', 'Hamstrings']::text[],
      'Barbell',
      'Intermediate',
      'Perform Barbell Deadlift with controlled tempo, full range of motion, and stable back engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Barbell Shrug',
      'Strength',
      'Back',
      array['Traps']::text[],
      'Barbell',
      'Beginner',
      'Perform Barbell Shrug with controlled tempo, full range of motion, and stable back engagement using barbell.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Bird Dog Row',
      'Strength',
      'Back',
      array['Core', 'Glutes']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Bird Dog Row with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Cable Pullover',
      'Strength',
      'Back',
      array['Lats']::text[],
      'Cable',
      'Intermediate',
      'Perform Cable Pullover with controlled tempo, full range of motion, and stable back engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Chest-Supported Dumbbell Row',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Chest-Supported Dumbbell Row with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Chest-Supported Row',
      'Strength',
      'Back',
      array['Biceps', 'Rear Delts']::text[],
      'Machine',
      'Beginner',
      'Lie chest-down on an incline pad and row handles toward the lower ribs.',
      'This setup reduces lower-back strain on heavy sets.'
    ),
    (
      'Chest-Supported T-Bar Row',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Machine',
      'Beginner',
      'Perform Chest-Supported T-Bar Row with controlled tempo, full range of motion, and stable back engagement using machine.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Chin-Up',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Bodyweight',
      'Advanced',
      'Use an underhand grip, pull the chest toward the bar, and lower slowly.',
      'Keep ribs down to limit lower-back arch.'
    ),
    (
      'Close-Grip Lat Pulldown',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Cable',
      'Beginner',
      'Perform Close-Grip Lat Pulldown with controlled tempo, full range of motion, and stable back engagement using cable.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Commando Pull-Up',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Commando Pull-Up with controlled tempo, full range of motion, and stable back engagement using bodyweight.',
      'Prioritize technique over load and scale back volume as needed.'
    ),
    (
      'Deficit Deadlift',
      'Strength',
      'Back',
      array['Glutes', 'Hamstrings']::text[],
      'Barbell',
      'Advanced',
      'Perform Deficit Deadlift with controlled tempo, full range of motion, and stable back engagement using barbell.',
      'Prioritize technique over load and scale back volume as needed.'
    ),
    (
      'Dumbbell Pullover',
      'Strength',
      'Back',
      array['Chest', 'Lats']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Dumbbell Pullover with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Dumbbell Romanian Deadlift',
      'Strength',
      'Back',
      array['Glutes', 'Hamstrings']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Dumbbell Romanian Deadlift with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Dumbbell Shrug',
      'Strength',
      'Back',
      array['Traps']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Dumbbell Shrug with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Face Pull',
      'Strength',
      'Back',
      array['Rear Delts', 'Rotator Cuff']::text[],
      'Cable',
      'Beginner',
      'Pull a rope attachment toward the face with elbows high and external rotation at the end.',
      'Use moderate weight and focus on rear delt and upper-back control.'
    ),
    (
      'Farmer Carry',
      'Strength',
      'Back',
      array['Core', 'Forearms']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Farmer Carry with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Good Morning',
      'Strength',
      'Back',
      array['Hamstrings', 'Glutes']::text[],
      'Barbell',
      'Advanced',
      'Perform Good Morning with controlled tempo, full range of motion, and stable back engagement using barbell.',
      'Prioritize technique over load and scale back volume as needed.'
    ),
    (
      'Hammer Strength Row',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Machine',
      'Beginner',
      'Perform Hammer Strength Row with controlled tempo, full range of motion, and stable back engagement using machine.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Helms Row',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Helms Row with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Inverted Row',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Machine',
      'Beginner',
      'Hang under a fixed bar, pull the chest to the bar, and lower under control.',
      'Keep the body in a straight line from heels to shoulders.'
    ),
    (
      'Kettlebell Deadlift',
      'Strength',
      'Back',
      array['Glutes', 'Hamstrings']::text[],
      'Kettlebell',
      'Beginner',
      'Perform Kettlebell Deadlift with controlled tempo, full range of motion, and stable back engagement using kettlebell.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Kettlebell Gorilla Row',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Gorilla Row with controlled tempo, full range of motion, and stable back engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kettlebell High Pull',
      'Strength',
      'Back',
      array['Traps', 'Shoulders']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell High Pull with controlled tempo, full range of motion, and stable back engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kneeling Lat Pulldown',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Cable',
      'Beginner',
      'Perform Kneeling Lat Pulldown with controlled tempo, full range of motion, and stable back engagement using cable.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Kroc Row',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Dumbbell',
      'Advanced',
      'Perform Kroc Row with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Prioritize technique over load and scale back volume as needed.'
    ),
    (
      'Lat Prayer',
      'Strength',
      'Back',
      array['Lats']::text[],
      'Cable',
      'Intermediate',
      'Perform Lat Prayer with controlled tempo, full range of motion, and stable back engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Machine Lat Pulldown',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Machine',
      'Beginner',
      'Perform Machine Lat Pulldown with controlled tempo, full range of motion, and stable back engagement using machine.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Meadows Row',
      'Strength',
      'Back',
      array['Biceps', 'Rear Delts']::text[],
      'Barbell',
      'Advanced',
      'Row one end of a landmine bar with a staggered stance and a neutral grip handle.',
      'Pull toward the back pocket for better lat engagement.'
    ),
    (
      'Muscle-Up',
      'Strength',
      'Back',
      array['Chest', 'Triceps']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Muscle-Up with controlled tempo, full range of motion, and stable back engagement using bodyweight.',
      'Prioritize technique over load and scale back volume as needed.'
    ),
    (
      'Neutral-Grip Lat Pulldown',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Cable',
      'Beginner',
      'Perform Neutral-Grip Lat Pulldown with controlled tempo, full range of motion, and stable back engagement using cable.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Pendlay Row',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Barbell',
      'Advanced',
      'From a dead stop on the floor each rep, explosively row the bar to the torso.',
      'Keep the torso parallel to the floor and reset between reps.'
    ),
    (
      'Pull-Up',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Hang with an overhand grip, pull until the chin clears the bar, and lower under control.',
      'Start each rep from a dead hang without swinging.'
    ),
    (
      'Pullover Machine',
      'Strength',
      'Back',
      array['Chest', 'Lats']::text[],
      'Machine',
      'Beginner',
      'Perform Pullover Machine with controlled tempo, full range of motion, and stable back engagement using machine.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Rack Chins',
      'Strength',
      'Back',
      array['Biceps', 'Lats']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Rack Chins with controlled tempo, full range of motion, and stable back engagement using bodyweight.',
      'Prioritize technique over load and scale back volume as needed.'
    ),
    (
      'Rack Pull',
      'Strength',
      'Back',
      array['Glutes', 'Hamstrings']::text[],
      'Barbell',
      'Advanced',
      'Deadlift a barbell from knee height or just below, focusing on upper-back extension.',
      'Use straps if needed and keep the bar close to the body.'
    ),
    (
      'Renegade Row',
      'Strength',
      'Back',
      array['Core', 'Biceps']::text[],
      'Dumbbell',
      'Advanced',
      'Perform Renegade Row with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Prioritize technique over load and scale back volume as needed.'
    ),
    (
      'Resistance Band Pulldown',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Pulldown with controlled tempo, full range of motion, and stable back engagement using resistance band.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Resistance Band Row',
      'Strength',
      'Back',
      array['Biceps']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Row with controlled tempo, full range of motion, and stable back engagement using resistance band.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Reverse Hyperextension',
      'Strength',
      'Back',
      array['Glutes', 'Hamstrings']::text[],
      'Machine',
      'Intermediate',
      'Perform Reverse Hyperextension with controlled tempo, full range of motion, and stable back engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Romanian Deadlift',
      'Strength',
      'Back',
      array['Glutes', 'Hamstrings']::text[],
      'Barbell',
      'Intermediate',
      'Perform Romanian Deadlift with controlled tempo, full range of motion, and stable back engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Scapular Pull-Up',
      'Strength',
      'Back',
      array['Traps']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Scapular Pull-Up with controlled tempo, full range of motion, and stable back engagement using bodyweight.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Seal Row',
      'Strength',
      'Back',
      array['Biceps', 'Rear Delts']::text[],
      'Barbell',
      'Intermediate',
      'Perform Seal Row with controlled tempo, full range of motion, and stable back engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Seated Cable Row',
      'Strength',
      'Back',
      array['Biceps', 'Rear Delts']::text[],
      'Cable',
      'Beginner',
      'Sit tall, pull the handle to the abdomen, and squeeze the shoulder blades together.',
      'Keep the chest up and avoid leaning too far back.'
    ),
    (
      'Single-Arm Cable Row',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Cable',
      'Beginner',
      'Perform Single-Arm Cable Row with controlled tempo, full range of motion, and stable back engagement using cable.',
      'Start light, master form, and progress gradually on back training.'
    ),
    (
      'Single-Arm Dumbbell Row',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Dumbbell',
      'Beginner',
      'Support one hand on a bench, row the dumbbell to the hip, and lower with control.',
      'Keep the torso stable and avoid rotating excessively.'
    ),
    (
      'Single-Arm Lat Pulldown',
      'Strength',
      'Back',
      array['Biceps', 'Core']::text[],
      'Cable',
      'Intermediate',
      'Perform Single-Arm Lat Pulldown with controlled tempo, full range of motion, and stable back engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Single-Leg Romanian Deadlift',
      'Strength',
      'Back',
      array['Glutes', 'Core']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Single-Leg Romanian Deadlift with controlled tempo, full range of motion, and stable back engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Arnold Press',
      'Strength',
      'Shoulders',
      array['Triceps']::text[],
      'Dumbbell',
      'Intermediate',
      'Start with palms facing you, rotate outward as you press overhead, and reverse on the way down.',
      'Use a smooth rotation rather than rushing the transition.'
    ),
    (
      'Barbell Front Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Barbell',
      'Beginner',
      'Perform Barbell Front Raise with controlled tempo, full range of motion, and stable shoulders engagement using barbell.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Barbell High Pull',
      'Strength',
      'Shoulders',
      array['Traps', 'Legs']::text[],
      'Barbell',
      'Advanced',
      'Perform Barbell High Pull with controlled tempo, full range of motion, and stable shoulders engagement using barbell.',
      'Prioritize technique over load and scale shoulders volume as needed.'
    ),
    (
      'Barbell Overhead Press',
      'Strength',
      'Shoulders',
      array['Triceps', 'Upper Chest']::text[],
      'Barbell',
      'Intermediate',
      'Press the bar from front-rack or collarbone height to full lockout overhead.',
      'Squeeze glutes and brace the core to limit excessive back lean.'
    ),
    (
      'Behind-the-Neck Press',
      'Strength',
      'Shoulders',
      array['Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Behind-the-Neck Press with controlled tempo, full range of motion, and stable shoulders engagement using barbell.',
      'Prioritize technique over load and scale shoulders volume as needed.'
    ),
    (
      'Bent-Over Lateral Raise',
      'Strength',
      'Shoulders',
      array['Rear Delts']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Bent-Over Lateral Raise with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Bradford Press',
      'Strength',
      'Shoulders',
      array['Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Bradford Press with controlled tempo, full range of motion, and stable shoulders engagement using barbell.',
      'Prioritize technique over load and scale shoulders volume as needed.'
    ),
    (
      'Bus Driver',
      'Strength',
      'Shoulders',
      array['Core']::text[],
      'Plate',
      'Beginner',
      'Hold a plate at chest height and rotate it side to side like steering a wheel.',
      'Keep ribs down and move through the shoulders, not the lower back.'
    ),
    (
      'Cable Front Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Cable Front Raise with controlled tempo, full range of motion, and stable shoulders engagement using cable.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Cable Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Cable',
      'Beginner',
      'Stand sideways to the cable and raise the handle laterally to shoulder height.',
      'Keep a slight bend in the elbow and pause briefly at the top.'
    ),
    (
      'Cable Overhead Press',
      'Strength',
      'Shoulders',
      array['Triceps']::text[],
      'Cable',
      'Beginner',
      'Perform Cable Overhead Press with controlled tempo, full range of motion, and stable shoulders engagement using cable.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Cable W-Raise',
      'Strength',
      'Shoulders',
      array['Rotator Cuff']::text[],
      'Cable',
      'Beginner',
      'Perform Cable W-Raise with controlled tempo, full range of motion, and stable shoulders engagement using cable.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Cable Y-Raise',
      'Strength',
      'Shoulders',
      array['Traps']::text[],
      'Cable',
      'Beginner',
      'Perform Cable Y-Raise with controlled tempo, full range of motion, and stable shoulders engagement using cable.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Cuban Press',
      'Strength',
      'Shoulders',
      array['Rotator Cuff']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform an upright row, externally rotate at the top, then press overhead.',
      'Use light weight and prioritize shoulder control over load.'
    ),
    (
      'Dumbbell Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Raise dumbbells out to the sides until upper arms are parallel to the floor.',
      'Lead with elbows and use controlled tempo with lighter weight.'
    ),
    (
      'Dumbbell Push Press',
      'Strength',
      'Shoulders',
      array['Triceps', 'Legs']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Dumbbell Push Press with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'External Rotation',
      'Strength',
      'Shoulders',
      array['Rotator Cuff']::text[],
      'Cable',
      'Beginner',
      'Perform External Rotation with controlled tempo, full range of motion, and stable shoulders engagement using cable.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Front Plate Raise',
      'Strength',
      'Shoulders',
      array['Upper Chest']::text[],
      'Plate',
      'Beginner',
      'Hold a plate with both hands and raise it to eye level with straight arms.',
      'Stop before shoulders shrug upward.'
    ),
    (
      'Handstand Push-Up',
      'Strength',
      'Shoulders',
      array['Triceps', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Handstand Push-Up with controlled tempo, full range of motion, and stable shoulders engagement using bodyweight.',
      'Prioritize technique over load and scale shoulders volume as needed.'
    ),
    (
      'Internal Rotation',
      'Strength',
      'Shoulders',
      array['Rotator Cuff']::text[],
      'Cable',
      'Beginner',
      'Perform Internal Rotation with controlled tempo, full range of motion, and stable shoulders engagement using cable.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Kettlebell Bottoms-Up Press',
      'Strength',
      'Shoulders',
      array['Core']::text[],
      'Kettlebell',
      'Advanced',
      'Perform Kettlebell Bottoms-Up Press with controlled tempo, full range of motion, and stable shoulders engagement using kettlebell.',
      'Prioritize technique over load and scale shoulders volume as needed.'
    ),
    (
      'Kettlebell Halo',
      'Strength',
      'Shoulders',
      array['Core']::text[],
      'Kettlebell',
      'Beginner',
      'Perform Kettlebell Halo with controlled tempo, full range of motion, and stable shoulders engagement using kettlebell.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Kettlebell Push Press',
      'Strength',
      'Shoulders',
      array['Triceps']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Push Press with controlled tempo, full range of motion, and stable shoulders engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Landmine Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Hold the end of a landmine bar and raise it laterally to shoulder height.',
      'Keep the torso still and control the lowering phase.'
    ),
    (
      'Lean-Away Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Lean-Away Lateral Raise with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Lu Raise',
      'Strength',
      'Shoulders',
      array['Traps']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Lu Raise with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Machine Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Machine Lateral Raise with controlled tempo, full range of motion, and stable shoulders engagement using machine.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Machine Reverse Fly',
      'Strength',
      'Shoulders',
      array['Upper Back']::text[],
      'Machine',
      'Beginner',
      'Perform Machine Reverse Fly with controlled tempo, full range of motion, and stable shoulders engagement using machine.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Machine Shoulder Press',
      'Strength',
      'Shoulders',
      array['Triceps']::text[],
      'Machine',
      'Beginner',
      'Press machine handles overhead from ear level without locking out harshly.',
      'Adjust the seat so handles start near shoulder height.'
    ),
    (
      'Overhead Plate Carry',
      'Strength',
      'Shoulders',
      array['Core']::text[],
      'Plate',
      'Intermediate',
      'Perform Overhead Plate Carry with controlled tempo, full range of motion, and stable shoulders engagement using plate.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Partial Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Perform Partial Lateral Raise with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Pike Push-Up',
      'Strength',
      'Shoulders',
      array['Triceps']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Pike Push-Up with controlled tempo, full range of motion, and stable shoulders engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Plate Front Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Plate',
      'Beginner',
      'Perform Plate Front Raise with controlled tempo, full range of motion, and stable shoulders engagement using plate.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Prone T Raise',
      'Strength',
      'Shoulders',
      array['Rear Delts']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Prone T Raise with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Prone W Raise',
      'Strength',
      'Shoulders',
      array['Rotator Cuff']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Prone W Raise with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Prone Y Raise',
      'Strength',
      'Shoulders',
      array['Traps']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Prone Y Raise with controlled tempo, full range of motion, and stable shoulders engagement using dumbbell.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Push Press',
      'Strength',
      'Shoulders',
      array['Triceps', 'Legs']::text[],
      'Barbell',
      'Advanced',
      'Dip slightly at the knees and drive the bar overhead using leg and shoulder power.',
      'Use the legs minimally and finish with stable lockout overhead.'
    ),
    (
      'Resistance Band Face Pull',
      'Strength',
      'Shoulders',
      array['Upper Back']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Face Pull with controlled tempo, full range of motion, and stable shoulders engagement using resistance band.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Resistance Band Lateral Raise',
      'Strength',
      'Shoulders',
      array[]::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Lateral Raise with controlled tempo, full range of motion, and stable shoulders engagement using resistance band.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      'Resistance Band Pull-Apart',
      'Strength',
      'Shoulders',
      array['Upper Back']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Pull-Apart with controlled tempo, full range of motion, and stable shoulders engagement using resistance band.',
      'Start light, master form, and progress gradually on shoulders training.'
    ),
    (
      '21s Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Perform 21s Curl with controlled tempo, full range of motion, and stable biceps engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Alternating Dumbbell Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Perform Alternating Dumbbell Curl with controlled tempo, full range of motion, and stable biceps engagement using dumbbell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Barbell Biceps Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Barbell',
      'Beginner',
      'Curl the bar from full extension to shoulder level without swinging the torso.',
      'Keep elbows pinned at the sides throughout the set.'
    ),
    (
      'Bayesian Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Bayesian Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Cable Biceps Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Curl a straight bar attachment from full extension to shoulder level.',
      'Constant cable tension makes the eccentric phase especially effective.'
    ),
    (
      'Cable Drag Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Cable Drag Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Cable Hammer Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Cable',
      'Beginner',
      'Perform Cable Hammer Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Cable Preacher Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Cable Preacher Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Cheat Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Barbell',
      'Advanced',
      'Perform Cheat Curl with controlled tempo, full range of motion, and stable biceps engagement using barbell.',
      'Prioritize technique over load and scale biceps volume as needed.'
    ),
    (
      'Chin-Up Hold',
      'Strength',
      'Biceps',
      array['Back']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Chin-Up Hold with controlled tempo, full range of motion, and stable biceps engagement using bodyweight.',
      'Prioritize technique over load and scale biceps volume as needed.'
    ),
    (
      'Close-Grip Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Barbell',
      'Beginner',
      'Perform Close-Grip Curl with controlled tempo, full range of motion, and stable biceps engagement using barbell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Concentration Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Brace the elbow against the inner thigh and curl the dumbbell to the shoulder.',
      'Squeeze at the top and lower slowly for full tension.'
    ),
    (
      'Cross-Body Hammer Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Cross-Body Hammer Curl with controlled tempo, full range of motion, and stable biceps engagement using dumbbell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Double-Arm Cable Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Double-Arm Cable Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Drag Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Perform Drag Curl with controlled tempo, full range of motion, and stable biceps engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Dumbbell Hammer Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Dumbbell',
      'Beginner',
      'Curl dumbbells with a neutral grip, keeping palms facing each other.',
      'Alternate arms or curl both together with strict form.'
    ),
    (
      'EZ-Bar Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Barbell',
      'Beginner',
      'Curl an EZ-bar using the angled grip to reduce wrist strain.',
      'Avoid leaning back as the weight gets heavy.'
    ),
    (
      'Fat-Grip Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Fat-Grip Curl with controlled tempo, full range of motion, and stable biceps engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'High Cable Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform High Cable Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Incline Cable Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Incline Cable Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Incline Dumbbell Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Dumbbell',
      'Intermediate',
      'Lie on an incline bench and curl dumbbells through a full range of motion.',
      'Keep shoulders back on the pad and avoid lifting the elbows.'
    ),
    (
      'Kettlebell Bottoms-Up Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Kettlebell',
      'Advanced',
      'Perform Kettlebell Bottoms-Up Curl with controlled tempo, full range of motion, and stable biceps engagement using kettlebell.',
      'Prioritize technique over load and scale biceps volume as needed.'
    ),
    (
      'Kettlebell Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Kettlebell',
      'Beginner',
      'Perform Kettlebell Curl with controlled tempo, full range of motion, and stable biceps engagement using kettlebell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Lying Cable Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Lying Cable Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Machine Biceps Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Machine Biceps Curl with controlled tempo, full range of motion, and stable biceps engagement using machine.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Machine Preacher Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Machine Preacher Curl with controlled tempo, full range of motion, and stable biceps engagement using machine.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Overhead Cable Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Overhead Cable Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Pinwheel Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Perform Pinwheel Curl with controlled tempo, full range of motion, and stable biceps engagement using dumbbell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Preacher Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Curl with upper arms supported on a preacher bench pad.',
      'Do not hyperextend the elbows at the bottom.'
    ),
    (
      'Resistance Band Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Curl with controlled tempo, full range of motion, and stable biceps engagement using resistance band.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Reverse Cable Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Cable',
      'Beginner',
      'Perform Reverse Cable Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Reverse Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Barbell',
      'Beginner',
      'Perform Reverse Curl with controlled tempo, full range of motion, and stable biceps engagement using barbell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Reverse Dumbbell Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Reverse Dumbbell Curl with controlled tempo, full range of motion, and stable biceps engagement using dumbbell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Rope Hammer Curl',
      'Strength',
      'Biceps',
      array['Forearms']::text[],
      'Cable',
      'Beginner',
      'Perform Rope Hammer Curl with controlled tempo, full range of motion, and stable biceps engagement using cable.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Seated Dumbbell Curl',
      'Strength',
      'Biceps',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Perform Seated Dumbbell Curl with controlled tempo, full range of motion, and stable biceps engagement using dumbbell.',
      'Start light, master form, and progress gradually on biceps training.'
    ),
    (
      'Bench Dip',
      'Strength',
      'Triceps',
      array['Chest', 'Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Place hands on a bench behind you, lower the hips by bending the elbows, and press back up.',
      'Keep the torso upright to target triceps more than chest.'
    ),
    (
      'Board Press',
      'Strength',
      'Triceps',
      array['Chest']::text[],
      'Barbell',
      'Advanced',
      'Perform Board Press with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Bodyweight Triceps Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Bodyweight Triceps Extension with controlled tempo, full range of motion, and stable triceps engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Cable Kickback',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Cable Kickback with controlled tempo, full range of motion, and stable triceps engagement using cable.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Cable Rope Triceps Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Push a rope attachment down and split the ends at lockout.',
      'Spread the rope at the bottom for a stronger triceps contraction.'
    ),
    (
      'Cable Triceps Pushdown',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Push a straight bar down to full elbow extension while upper arms stay fixed.',
      'Keep shoulders down and avoid leaning over the cable.'
    ),
    (
      'California Press',
      'Strength',
      'Triceps',
      array['Chest']::text[],
      'Barbell',
      'Advanced',
      'Perform California Press with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Close-Grip Bench Press',
      'Strength',
      'Triceps',
      array['Chest', 'Shoulders']::text[],
      'Barbell',
      'Intermediate',
      'Bench press with hands shoulder-width apart to emphasize triceps.',
      'Keep elbows tucked closer to the body than a standard bench press.'
    ),
    (
      'Cross-Body Cable Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Cross-Body Cable Extension with controlled tempo, full range of motion, and stable triceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Decline Close-Grip Press',
      'Strength',
      'Triceps',
      array['Chest']::text[],
      'Barbell',
      'Intermediate',
      'Perform Decline Close-Grip Press with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Diamond Push-Up',
      'Strength',
      'Triceps',
      array['Chest', 'Core']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform a push-up with hands close together under the chest in a diamond shape.',
      'Maintain a straight body line and full range of motion.'
    ),
    (
      'Dumbbell Skull Crusher',
      'Strength',
      'Triceps',
      array[]::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Dumbbell Skull Crusher with controlled tempo, full range of motion, and stable triceps engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'EZ-Bar Skull Crusher',
      'Strength',
      'Triceps',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Lie on a bench and lower the bar toward the forehead, then extend the elbows.',
      'Use a slight angle toward the top of the head rather than straight to the face.'
    ),
    (
      'Floor Skull Crusher',
      'Strength',
      'Triceps',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Perform Floor Skull Crusher with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Incline Skull Crusher',
      'Strength',
      'Triceps',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Perform Incline Skull Crusher with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'JM Press',
      'Strength',
      'Triceps',
      array['Chest']::text[],
      'Barbell',
      'Advanced',
      'Perform JM Press with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Kettlebell Overhead Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Overhead Extension with controlled tempo, full range of motion, and stable triceps engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kettlebell Triceps Press',
      'Strength',
      'Triceps',
      array['Chest']::text[],
      'Kettlebell',
      'Beginner',
      'Perform Kettlebell Triceps Press with controlled tempo, full range of motion, and stable triceps engagement using kettlebell.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Kickback',
      'Strength',
      'Triceps',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Perform Kickback with controlled tempo, full range of motion, and stable triceps engagement using dumbbell.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Lying Dumbbell Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Lying Dumbbell Extension with controlled tempo, full range of motion, and stable triceps engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Machine Dip',
      'Strength',
      'Triceps',
      array['Chest']::text[],
      'Machine',
      'Beginner',
      'Perform Machine Dip with controlled tempo, full range of motion, and stable triceps engagement using machine.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Machine Triceps Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Machine Triceps Extension with controlled tempo, full range of motion, and stable triceps engagement using machine.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Overhead Barbell Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Barbell',
      'Advanced',
      'Perform Overhead Barbell Extension with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Overhead Cable Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Overhead Cable Extension with controlled tempo, full range of motion, and stable triceps engagement using cable.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Overhead Dumbbell Triceps Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Dumbbell',
      'Intermediate',
      'Press a dumbbell overhead, lower it behind the head by bending the elbows, and extend back up.',
      'Keep elbows pointing forward and core braced.'
    ),
    (
      'Overhead Rope Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Overhead Rope Extension with controlled tempo, full range of motion, and stable triceps engagement using cable.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Pin Press Close-Grip',
      'Strength',
      'Triceps',
      array[]::text[],
      'Barbell',
      'Advanced',
      'Perform Pin Press Close-Grip with controlled tempo, full range of motion, and stable triceps engagement using barbell.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Resistance Band Overhead Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Overhead Extension with controlled tempo, full range of motion, and stable triceps engagement using resistance band.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Resistance Band Pushdown',
      'Strength',
      'Triceps',
      array[]::text[],
      'Resistance Band',
      'Beginner',
      'Perform Resistance Band Pushdown with controlled tempo, full range of motion, and stable triceps engagement using resistance band.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Reverse Dip',
      'Strength',
      'Triceps',
      array['Shoulders']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Reverse Dip with controlled tempo, full range of motion, and stable triceps engagement using bodyweight.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Reverse-Grip Pushdown',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Reverse-Grip Pushdown with controlled tempo, full range of motion, and stable triceps engagement using cable.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Ring Dip',
      'Strength',
      'Triceps',
      array['Chest']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Ring Dip with controlled tempo, full range of motion, and stable triceps engagement using bodyweight.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Rolling Dumbbell Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Dumbbell',
      'Advanced',
      'Perform Rolling Dumbbell Extension with controlled tempo, full range of motion, and stable triceps engagement using dumbbell.',
      'Prioritize technique over load and scale triceps volume as needed.'
    ),
    (
      'Single-Arm Cable Overhead Extension',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Intermediate',
      'Perform Single-Arm Cable Overhead Extension with controlled tempo, full range of motion, and stable triceps engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Single-Arm Cable Pushdown',
      'Strength',
      'Triceps',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Single-Arm Cable Pushdown with controlled tempo, full range of motion, and stable triceps engagement using cable.',
      'Start light, master form, and progress gradually on triceps training.'
    ),
    (
      'Abductor Machine',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Abductor Machine with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Adductor Machine',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Adductor Machine with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Anderson Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Advanced',
      'Perform Anderson Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Assisted Pistol Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Assisted Pistol Squat with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Barbell Back Squat',
      'Strength',
      'Legs',
      array['Glutes', 'Core']::text[],
      'Barbell',
      'Intermediate',
      'Sit hips back and down, keep knees tracking over toes, and drive through mid-foot to stand.',
      'Brace the core before descending and maintain a neutral spine.'
    ),
    (
      'Barbell Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Barbell',
      'Beginner',
      'Perform Barbell Calf Raise with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Barbell Lunge',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Intermediate',
      'Perform Barbell Lunge with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Belt Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Intermediate',
      'Wear a dip belt attached to load and squat without axial barbell compression on the spine.',
      'Useful when training legs around back fatigue or injury limitations.'
    ),
    (
      'Box Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Advanced',
      'Perform Box Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Bulgarian Split Squat',
      'Strength',
      'Legs',
      array['Glutes', 'Core']::text[],
      'Dumbbell',
      'Intermediate',
      'Place the rear foot on a bench, lower the front knee, and drive up through the front leg.',
      'Keep most of the weight on the front heel.'
    ),
    (
      'Cable Pull-Through Lunge',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Cable',
      'Intermediate',
      'Perform Cable Pull-Through Lunge with controlled tempo, full range of motion, and stable legs engagement using cable.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Conventional Deadlift',
      'Strength',
      'Legs',
      array['Glutes', 'Back']::text[],
      'Barbell',
      'Intermediate',
      'Perform Conventional Deadlift with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Cossack Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Cossack Squat with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Deficit Reverse Lunge',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Deficit Reverse Lunge with controlled tempo, full range of motion, and stable legs engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Donkey Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Intermediate',
      'Perform Donkey Calf Raise with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Dumbbell Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Perform Dumbbell Calf Raise with controlled tempo, full range of motion, and stable legs engagement using dumbbell.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Dumbbell Sumo Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Dumbbell Sumo Squat with controlled tempo, full range of motion, and stable legs engagement using dumbbell.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Front Foot Elevated Split Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Front Foot Elevated Split Squat with controlled tempo, full range of motion, and stable legs engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Front Rack Kettlebell Squat',
      'Strength',
      'Legs',
      array['Core']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Front Rack Kettlebell Squat with controlled tempo, full range of motion, and stable legs engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Front Squat',
      'Strength',
      'Legs',
      array['Core', 'Glutes']::text[],
      'Barbell',
      'Advanced',
      'Hold the bar in a front-rack position, squat to depth, and stand while keeping the torso upright.',
      'Elbows high and wrists relaxed to keep the bar secure.'
    ),
    (
      'Goblet Squat',
      'Strength',
      'Legs',
      array['Glutes', 'Core']::text[],
      'Kettlebell',
      'Beginner',
      'Hold a kettlebell at chest height, squat between the hips, and stand tall.',
      'Use the elbows to push knees out slightly at the bottom.'
    ),
    (
      'Hack Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Intermediate',
      'Place shoulders under pads, lower until thighs are parallel, and press back up.',
      'Keep feet positioned to feel even pressure through the whole foot.'
    ),
    (
      'Hatfield Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Advanced',
      'Perform Hatfield Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Hip Abduction Machine',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Beginner',
      'Perform Hip Abduction Machine with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Hip Adduction Cable',
      'Strength',
      'Legs',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Hip Adduction Cable with controlled tempo, full range of motion, and stable legs engagement using cable.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Horizontal Leg Press',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Beginner',
      'Perform Horizontal Leg Press with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Jefferson Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Advanced',
      'Perform Jefferson Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Kettlebell Front Rack Lunge',
      'Strength',
      'Legs',
      array['Glutes', 'Core']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Front Rack Lunge with controlled tempo, full range of motion, and stable legs engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kettlebell Goblet Reverse Lunge',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Kettlebell',
      'Beginner',
      'Perform Kettlebell Goblet Reverse Lunge with controlled tempo, full range of motion, and stable legs engagement using kettlebell.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Kettlebell Single-Leg Deadlift',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Single-Leg Deadlift with controlled tempo, full range of motion, and stable legs engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Landmine Reverse Lunge',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Intermediate',
      'Perform Landmine Reverse Lunge with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Landmine Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Beginner',
      'Perform Landmine Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Leg Extension',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Extend the knees to lift the pad, squeeze the quads at the top, and lower under control.',
      'Adjust the pad so it sits above the ankles.'
    ),
    (
      'Leg Press',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Beginner',
      'Lower the sled until knees reach roughly 90 degrees, then press without locking knees forcefully.',
      'Do not allow the lower back to peel off the pad at the bottom.'
    ),
    (
      'Leg Press Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Leg Press Calf Raise with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Lying Leg Curl',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Lie face down and curl the pad toward the glutes by flexing the knees.',
      'Keep hips pressed into the bench throughout the set.'
    ),
    (
      'Nordic Curl',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Nordic Curl with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Nordic Hamstring Curl',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Bodyweight',
      'Advanced',
      'Kneel with ankles secured, lower the torso forward under control, and push back up.',
      'Use hands lightly on the floor only as much as needed.'
    ),
    (
      'Overhead Squat',
      'Strength',
      'Legs',
      array['Core', 'Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Overhead Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Pause Squat',
      'Strength',
      'Legs',
      array['Glutes', 'Core']::text[],
      'Barbell',
      'Advanced',
      'Perform Pause Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Pendulum Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Intermediate',
      'Perform Pendulum Squat with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Pistol Squat',
      'Strength',
      'Legs',
      array['Glutes', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Pistol Squat with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Reverse Hack Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Intermediate',
      'Perform Reverse Hack Squat with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Safety Bar Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Barbell',
      'Intermediate',
      'Perform Safety Bar Squat with controlled tempo, full range of motion, and stable legs engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Seated Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'With knees bent at 90 degrees, raise heels as high as possible and lower slowly.',
      'Seated calf work emphasizes the soleus muscle.'
    ),
    (
      'Seated Leg Curl',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Sit with the pad behind the ankles and curl the legs under the seat.',
      'Control the eccentric and avoid lifting the hips off the seat.'
    ),
    (
      'Single-Leg Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Single-Leg Calf Raise with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Single-Leg Curl',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Single-Leg Curl with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Single-Leg Extension',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Single-Leg Extension with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Single-Leg Press',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Intermediate',
      'Perform Single-Leg Press with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Sissy Squat',
      'Strength',
      'Legs',
      array['Quads']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Sissy Squat with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Prioritize technique over load and scale legs volume as needed.'
    ),
    (
      'Slider Leg Curl',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Slider Leg Curl with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Smith Machine Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Smith Machine Calf Raise with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Smith Machine Lunge',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Beginner',
      'Perform Smith Machine Lunge with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Smith Machine Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Machine',
      'Beginner',
      'Perform Smith Machine Squat with controlled tempo, full range of motion, and stable legs engagement using machine.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Spanish Squat',
      'Strength',
      'Legs',
      array['Quads']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Spanish Squat with controlled tempo, full range of motion, and stable legs engagement using resistance band.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Split Squat',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Split Squat with controlled tempo, full range of motion, and stable legs engagement using dumbbell.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Stability Ball Leg Curl',
      'Strength',
      'Legs',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Stability Ball Leg Curl with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      'Standing Calf Raise',
      'Strength',
      'Legs',
      array[]::text[],
      'Machine',
      'Beginner',
      'Rise onto the balls of the feet, pause at the top, and lower heels below platform level.',
      'Use a full stretch at the bottom for better range of motion.'
    ),
    (
      'Step-Down',
      'Strength',
      'Legs',
      array['Quads']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Step-Down with controlled tempo, full range of motion, and stable legs engagement using bodyweight.',
      'Start light, master form, and progress gradually on legs training.'
    ),
    (
      '45-Degree Back Extension',
      'Strength',
      'Glutes',
      array['Hamstrings', 'Lower Back']::text[],
      'Machine',
      'Beginner',
      'Hinge at the hips on a back-extension bench and return to a neutral body line.',
      'Focus on hip extension rather than hyperextending the spine.'
    ),
    (
      'B-Stance Hip Thrust',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Barbell',
      'Intermediate',
      'Perform B-Stance Hip Thrust with controlled tempo, full range of motion, and stable glutes engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Banded Lateral Walk',
      'Strength',
      'Glutes',
      array['Hip Abductors']::text[],
      'Resistance Band',
      'Beginner',
      'Place a band above the knees and take controlled lateral steps while staying in a quarter squat.',
      'Keep tension on the band and knees aligned over toes.'
    ),
    (
      'Barbell Glute Bridge',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Barbell',
      'Intermediate',
      'Perform Barbell Glute Bridge with controlled tempo, full range of motion, and stable glutes engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Barbell Hip Thrust',
      'Strength',
      'Glutes',
      array['Hamstrings', 'Core']::text[],
      'Barbell',
      'Intermediate',
      'With upper back on a bench, drive hips up until the torso is parallel to the floor.',
      'Pause at the top and keep the chin tucked.'
    ),
    (
      'Cable Glute Bridge',
      'Strength',
      'Glutes',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Cable Glute Bridge with controlled tempo, full range of motion, and stable glutes engagement using cable.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Cable Glute Kickback',
      'Strength',
      'Glutes',
      array[]::text[],
      'Cable',
      'Beginner',
      'Attach an ankle strap and extend the leg backward while keeping the torso stable.',
      'Squeeze the glute at the end range without arching the lower back.'
    ),
    (
      'Cable Hip Abduction',
      'Strength',
      'Glutes',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Cable Hip Abduction with controlled tempo, full range of motion, and stable glutes engagement using cable.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Cable Pull-Through',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Cable',
      'Beginner',
      'Face away from the cable, hinge at the hips, and drive hips forward to stand tall.',
      'Keep a soft knee bend and feel tension in the glutes, not the lower back.'
    ),
    (
      'Clamshell',
      'Strength',
      'Glutes',
      array[]::text[],
      'Resistance Band',
      'Beginner',
      'Perform Clamshell with controlled tempo, full range of motion, and stable glutes engagement using resistance band.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Crossover Lunge',
      'Strength',
      'Glutes',
      array['Quads']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Crossover Lunge with controlled tempo, full range of motion, and stable glutes engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Curtsy Lunge',
      'Strength',
      'Glutes',
      array['Quads', 'Core']::text[],
      'Dumbbell',
      'Beginner',
      'Step one leg behind and across the body, lower into a lunge, and return to standing.',
      'Keep the front knee stable and torso upright.'
    ),
    (
      'Deficit Hip Thrust',
      'Strength',
      'Glutes',
      array[]::text[],
      'Barbell',
      'Advanced',
      'Perform Deficit Hip Thrust with controlled tempo, full range of motion, and stable glutes engagement using barbell.',
      'Prioritize technique over load and scale glutes volume as needed.'
    ),
    (
      'Deficit Romanian Deadlift',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Barbell',
      'Advanced',
      'Perform Deficit Romanian Deadlift with controlled tempo, full range of motion, and stable glutes engagement using barbell.',
      'Prioritize technique over load and scale glutes volume as needed.'
    ),
    (
      'Dumbbell Frog Pump',
      'Strength',
      'Glutes',
      array[]::text[],
      'Dumbbell',
      'Beginner',
      'Perform Dumbbell Frog Pump with controlled tempo, full range of motion, and stable glutes engagement using dumbbell.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Dumbbell Hip Thrust',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Dumbbell Hip Thrust with controlled tempo, full range of motion, and stable glutes engagement using dumbbell.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Dumbbell Step-Up',
      'Strength',
      'Glutes',
      array['Quads', 'Core']::text[],
      'Dumbbell',
      'Beginner',
      'Step onto a box, drive through the lead foot, and stand tall without pushing off the back leg.',
      'Use a box height where the thigh can reach parallel.'
    ),
    (
      'Elevated Glute Bridge',
      'Strength',
      'Glutes',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Elevated Glute Bridge with controlled tempo, full range of motion, and stable glutes engagement using bodyweight.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Fire Hydrant',
      'Strength',
      'Glutes',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Fire Hydrant with controlled tempo, full range of motion, and stable glutes engagement using bodyweight.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Frog Hip Thrust',
      'Strength',
      'Glutes',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Frog Hip Thrust with controlled tempo, full range of motion, and stable glutes engagement using bodyweight.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Frog Pump',
      'Strength',
      'Glutes',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Frog Pump with controlled tempo, full range of motion, and stable glutes engagement using bodyweight.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Glute Bridge',
      'Strength',
      'Glutes',
      array['Hamstrings', 'Core']::text[],
      'Bodyweight',
      'Beginner',
      'Lie on the floor, press through the heels, and lift hips until the body forms a straight line.',
      'Squeeze glutes hard at the top without overextending the lower back.'
    ),
    (
      'Glute-Ham Developer Raise',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Machine',
      'Advanced',
      'From the GHD, extend the hips and curl the body back to horizontal using hamstrings and glutes.',
      'Start with partial range if full reps are too difficult.'
    ),
    (
      'Good Morning to Hip Thrust',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Barbell',
      'Advanced',
      'Perform Good Morning to Hip Thrust with controlled tempo, full range of motion, and stable glutes engagement using barbell.',
      'Prioritize technique over load and scale glutes volume as needed.'
    ),
    (
      'Hyperextension with Barbell',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Machine',
      'Intermediate',
      'Perform Hyperextension with Barbell with controlled tempo, full range of motion, and stable glutes engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kas Glute Bridge',
      'Strength',
      'Glutes',
      array[]::text[],
      'Barbell',
      'Advanced',
      'Perform Kas Glute Bridge with controlled tempo, full range of motion, and stable glutes engagement using barbell.',
      'Prioritize technique over load and scale glutes volume as needed.'
    ),
    (
      'Kettlebell Dead Stop Swing',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Dead Stop Swing with controlled tempo, full range of motion, and stable glutes engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kettlebell Swing',
      'Strength',
      'Glutes',
      array['Hamstrings', 'Core']::text[],
      'Kettlebell',
      'Intermediate',
      'Hinge and explosively drive the hips to swing the kettlebell to chest height.',
      'Power comes from the hips, not the arms.'
    ),
    (
      'Kettlebell Swing American',
      'Strength',
      'Glutes',
      array['Core']::text[],
      'Kettlebell',
      'Advanced',
      'Perform Kettlebell Swing American with controlled tempo, full range of motion, and stable glutes engagement using kettlebell.',
      'Prioritize technique over load and scale glutes volume as needed.'
    ),
    (
      'Lateral Band Walk',
      'Strength',
      'Glutes',
      array[]::text[],
      'Resistance Band',
      'Beginner',
      'Perform Lateral Band Walk with controlled tempo, full range of motion, and stable glutes engagement using resistance band.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Lateral Step-Up',
      'Strength',
      'Glutes',
      array['Quads']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Lateral Step-Up with controlled tempo, full range of motion, and stable glutes engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Machine Hip Thrust',
      'Strength',
      'Glutes',
      array['Hamstrings']::text[],
      'Machine',
      'Beginner',
      'Perform Machine Hip Thrust with controlled tempo, full range of motion, and stable glutes engagement using machine.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Monster Walk',
      'Strength',
      'Glutes',
      array['Hip Abductors']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Monster Walk with controlled tempo, full range of motion, and stable glutes engagement using resistance band.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Paused Hip Thrust',
      'Strength',
      'Glutes',
      array[]::text[],
      'Barbell',
      'Intermediate',
      'Perform Paused Hip Thrust with controlled tempo, full range of motion, and stable glutes engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Quadruped Hip Extension',
      'Strength',
      'Glutes',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Quadruped Hip Extension with controlled tempo, full range of motion, and stable glutes engagement using bodyweight.',
      'Start light, master form, and progress gradually on glutes training.'
    ),
    (
      'Ab Wheel Rollout',
      'Strength',
      'Core',
      array['Shoulders', 'Lats']::text[],
      'Bodyweight',
      'Advanced',
      'Roll the wheel forward from kneeling or standing while maintaining a braced core.',
      'Only go as far as you can without losing lower-back position.'
    ),
    (
      'Arch Body Hold',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Arch Body Hold with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Back Extension Hold',
      'Strength',
      'Core',
      array['Lower Back']::text[],
      'Machine',
      'Beginner',
      'Perform Back Extension Hold with controlled tempo, full range of motion, and stable core engagement using machine.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Barbell Rollout',
      'Strength',
      'Core',
      array['Lats']::text[],
      'Barbell',
      'Advanced',
      'Perform Barbell Rollout with controlled tempo, full range of motion, and stable core engagement using barbell.',
      'Prioritize technique over load and scale core volume as needed.'
    ),
    (
      'Bear Crawl',
      'Strength',
      'Core',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Bear Crawl with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Bicycle Crunch',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Bodyweight',
      'Beginner',
      'Lie on the back and bring opposite elbow to knee in a controlled cycling motion.',
      'Avoid pulling on the neck; rotate through the upper back.'
    ),
    (
      'Bird Dog',
      'Strength',
      'Core',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Bird Dog with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Cable Anti-Rotation Press',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Cable',
      'Beginner',
      'Perform Cable Anti-Rotation Press with controlled tempo, full range of motion, and stable core engagement using cable.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Cable Reverse Crunch',
      'Strength',
      'Core',
      array[]::text[],
      'Cable',
      'Beginner',
      'Perform Cable Reverse Crunch with controlled tempo, full range of motion, and stable core engagement using cable.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Cable Side Bend',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Cable',
      'Beginner',
      'Perform Cable Side Bend with controlled tempo, full range of motion, and stable core engagement using cable.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Cable Wood Chop',
      'Strength',
      'Core',
      array['Obliques', 'Shoulders']::text[],
      'Cable',
      'Intermediate',
      'Rotate diagonally from high to low or low to high while bracing the core.',
      'Power comes from hip and trunk rotation, not arm pull alone.'
    ),
    (
      'Captain''s Chair Knee Raise',
      'Strength',
      'Core',
      array[]::text[],
      'Machine',
      'Beginner',
      'Perform Captain''s Chair Knee Raise with controlled tempo, full range of motion, and stable core engagement using machine.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Captain''s Chair Leg Raise',
      'Strength',
      'Core',
      array[]::text[],
      'Machine',
      'Intermediate',
      'Perform Captain''s Chair Leg Raise with controlled tempo, full range of motion, and stable core engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Copenhagen Plank',
      'Strength',
      'Core',
      array['Adductors']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Copenhagen Plank with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Prioritize technique over load and scale core volume as needed.'
    ),
    (
      'Dead Bug',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Lie on the back, extend opposite arm and leg, and return without arching the lower back.',
      'Press the lower back gently into the floor throughout.'
    ),
    (
      'Dead Bug with Band',
      'Strength',
      'Core',
      array[]::text[],
      'Resistance Band',
      'Beginner',
      'Perform Dead Bug with Band with controlled tempo, full range of motion, and stable core engagement using resistance band.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Decline Sit-Up',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Decline Sit-Up with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Dragon Flag',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Advanced',
      'Perform Dragon Flag with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Prioritize technique over load and scale core volume as needed.'
    ),
    (
      'Dumbbell Side Bend',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Dumbbell Side Bend with controlled tempo, full range of motion, and stable core engagement using dumbbell.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Farmer Hold',
      'Strength',
      'Core',
      array['Forearms']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Farmer Hold with controlled tempo, full range of motion, and stable core engagement using dumbbell.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Front Plank',
      'Strength',
      'Core',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Hold a push-up position on forearms with a straight line from head to heels.',
      'Ribs down, glutes engaged, and breathe steadily without sagging hips.'
    ),
    (
      'Half-Kneeling Pallof Press',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Cable',
      'Beginner',
      'Perform Half-Kneeling Pallof Press with controlled tempo, full range of motion, and stable core engagement using cable.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Hanging Knee Raise',
      'Strength',
      'Core',
      array['Hip Flexors']::text[],
      'Bodyweight',
      'Intermediate',
      'Hang from a bar and raise knees toward the chest under control.',
      'Avoid swinging by initiating the movement from the abs.'
    ),
    (
      'Hanging Leg Raise',
      'Strength',
      'Core',
      array['Hip Flexors']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Hanging Leg Raise with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Prioritize technique over load and scale core volume as needed.'
    ),
    (
      'Hollow Body Hold',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Intermediate',
      'Lie on the back, lift shoulders and legs slightly, and hold with lower back pressed down.',
      'Keep arms overhead and ribs pulled down for a strong hollow position.'
    ),
    (
      'Hollow Rock',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Hollow Rock with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kneeling Cable Crunch',
      'Strength',
      'Core',
      array[]::text[],
      'Cable',
      'Beginner',
      'Kneel facing the cable, hold a rope behind the head, and crunch down by flexing the spine.',
      'Think about bringing ribs toward pelvis rather than pulling with the arms.'
    ),
    (
      'L-Sit',
      'Strength',
      'Core',
      array['Hip Flexors']::text[],
      'Bodyweight',
      'Advanced',
      'Perform L-Sit with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Prioritize technique over load and scale core volume as needed.'
    ),
    (
      'Landmine Rotation',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Barbell',
      'Intermediate',
      'Perform Landmine Rotation with controlled tempo, full range of motion, and stable core engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'McGill Curl-Up',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform McGill Curl-Up with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Mountain Climber Cross',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Mountain Climber Cross with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Overhead Carry',
      'Strength',
      'Core',
      array['Shoulders']::text[],
      'Kettlebell',
      'Advanced',
      'Perform Overhead Carry with controlled tempo, full range of motion, and stable core engagement using kettlebell.',
      'Prioritize technique over load and scale core volume as needed.'
    ),
    (
      'Pallof Press',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Cable',
      'Beginner',
      'Press a cable handle straight out from the chest and resist rotation.',
      'Stand tall and hold the end position for one to two seconds.'
    ),
    (
      'Plank Jacks',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Plank Jacks with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Plank to Push-Up',
      'Strength',
      'Core',
      array['Shoulders']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Plank to Push-Up with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Plank with Shoulder Tap',
      'Strength',
      'Core',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Plank with Shoulder Tap with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Reverse Crunch',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Reverse Crunch with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'RKC Plank',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Advanced',
      'Perform RKC Plank with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Prioritize technique over load and scale core volume as needed.'
    ),
    (
      'Russian Twist',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Ball',
      'Beginner',
      'Sit with feet elevated, rotate the torso side to side while holding a medicine ball.',
      'Move from the thoracic spine and keep the chest lifted.'
    ),
    (
      'Side Plank',
      'Strength',
      'Core',
      array['Obliques', 'Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Support the body on one forearm with hips stacked and body in a straight line.',
      'Lift hips to neutral and do not let them drop toward the floor.'
    ),
    (
      'Side Plank with Rotation',
      'Strength',
      'Core',
      array['Obliques']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Side Plank with Rotation with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Stability Ball Rollout',
      'Strength',
      'Core',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Stability Ball Rollout with controlled tempo, full range of motion, and stable core engagement using bodyweight.',
      'Start light, master form, and progress gradually on core training.'
    ),
    (
      'Agility Ladder Drill',
      'Cardio',
      'Cardio',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Agility Ladder Drill with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Start light, master form, and progress gradually on cardio training.'
    ),
    (
      'Air Bike Sprint',
      'Cardio',
      'Cardio',
      array['Arms']::text[],
      'Machine',
      'Advanced',
      'Perform Air Bike Sprint with controlled tempo, full range of motion, and stable cardio engagement using machine.',
      'Prioritize technique over load and scale cardio volume as needed.'
    ),
    (
      'Assault Bike',
      'Cardio',
      'Cardio',
      array['Legs', 'Arms']::text[],
      'Machine',
      'Intermediate',
      'Pedal and push/pull handles together for sprints or steady conditioning work.',
      'Brace the core during hard intervals to stay stable on the seat.'
    ),
    (
      'Battle Ropes',
      'Cardio',
      'Cardio',
      array['Shoulders', 'Core']::text[],
      'Bodyweight',
      'Intermediate',
      'Create waves or slams with the ropes using alternating or simultaneous arm action.',
      'Keep the hips stable and generate power from the core and arms together.'
    ),
    (
      'Box Jump',
      'Cardio',
      'Cardio',
      array['Legs', 'Glutes']::text[],
      'Bodyweight',
      'Advanced',
      'Swing arms, jump onto the box with both feet, stand tall, and step down under control.',
      'Choose a box height you can land on quietly and consistently.'
    ),
    (
      'Burpee',
      'Cardio',
      'Cardio',
      array['Legs', 'Chest', 'Core']::text[],
      'Bodyweight',
      'Intermediate',
      'Drop to the floor, perform a push-up, jump feet in, and explode upward.',
      'Step back instead of jumping if low-impact modification is needed.'
    ),
    (
      'Butt Kicks',
      'Cardio',
      'Cardio',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Butt Kicks with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Start light, master form, and progress gradually on cardio training.'
    ),
    (
      'Double Under',
      'Cardio',
      'Cardio',
      array[]::text[],
      'Bodyweight',
      'Advanced',
      'Perform Double Under with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Prioritize technique over load and scale cardio volume as needed.'
    ),
    (
      'Elliptical Trainer',
      'Cardio',
      'Cardio',
      array['Legs']::text[],
      'Machine',
      'Beginner',
      'Maintain smooth elliptical strides using both arms and legs at a sustainable pace.',
      'Stand tall and avoid leaning heavily on the handles.'
    ),
    (
      'Farmer Walk Sprint',
      'Cardio',
      'Cardio',
      array['Core']::text[],
      'Dumbbell',
      'Advanced',
      'Perform Farmer Walk Sprint with controlled tempo, full range of motion, and stable cardio engagement using dumbbell.',
      'Prioritize technique over load and scale cardio volume as needed.'
    ),
    (
      'Heavy Bag Work',
      'Cardio',
      'Cardio',
      array['Shoulders']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Heavy Bag Work with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'High Knees',
      'Cardio',
      'Cardio',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform High Knees with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Start light, master form, and progress gradually on cardio training.'
    ),
    (
      'Hill Sprint',
      'Cardio',
      'Cardio',
      array['Glutes']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Hill Sprint with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Prioritize technique over load and scale cardio volume as needed.'
    ),
    (
      'Incline Treadmill Walk',
      'Cardio',
      'Cardio',
      array['Glutes']::text[],
      'Machine',
      'Beginner',
      'Perform Incline Treadmill Walk with controlled tempo, full range of motion, and stable cardio engagement using machine.',
      'Start light, master form, and progress gradually on cardio training.'
    ),
    (
      'Jump Rope',
      'Cardio',
      'Cardio',
      array['Calves']::text[],
      'Bodyweight',
      'Beginner',
      'Jump with small, quick hops while turning the rope with the wrists.',
      'Stay on the balls of the feet and keep elbows close to the body.'
    ),
    (
      'Jumping Jack',
      'Cardio',
      'Cardio',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Jump feet out while raising arms overhead, then return to the starting position.',
      'Land softly and maintain a steady breathing rhythm.'
    ),
    (
      'Kettlebell Snatch Conditioning',
      'Cardio',
      'Cardio',
      array['Shoulders']::text[],
      'Kettlebell',
      'Advanced',
      'Perform Kettlebell Snatch Conditioning with controlled tempo, full range of motion, and stable cardio engagement using kettlebell.',
      'Prioritize technique over load and scale cardio volume as needed.'
    ),
    (
      'Lateral Shuffle',
      'Cardio',
      'Cardio',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Lateral Shuffle with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Start light, master form, and progress gradually on cardio training.'
    ),
    (
      'Mountain Climber',
      'Cardio',
      'Cardio',
      array['Core', 'Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'From a push-up position, drive knees toward the chest in an alternating rhythm.',
      'Keep shoulders over wrists and hips level.'
    ),
    (
      'Rowing Ergometer',
      'Cardio',
      'Cardio',
      array['Back', 'Legs']::text[],
      'Machine',
      'Intermediate',
      'Drive with the legs first, lean back slightly, then pull the handle to the sternum.',
      'Return in the reverse order: arms, body, legs.'
    ),
    (
      'Rowing Sprint',
      'Cardio',
      'Cardio',
      array['Back']::text[],
      'Machine',
      'Advanced',
      'Perform Rowing Sprint with controlled tempo, full range of motion, and stable cardio engagement using machine.',
      'Prioritize technique over load and scale cardio volume as needed.'
    ),
    (
      'Shadow Boxing',
      'Cardio',
      'Cardio',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Shadow Boxing with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Start light, master form, and progress gradually on cardio training.'
    ),
    (
      'Single Under',
      'Cardio',
      'Cardio',
      array[]::text[],
      'Bodyweight',
      'Beginner',
      'Perform Single Under with controlled tempo, full range of motion, and stable cardio engagement using bodyweight.',
      'Start light, master form, and progress gradually on cardio training.'
    ),
    (
      'Ski Erg',
      'Cardio',
      'Cardio',
      array['Back', 'Arms']::text[],
      'Machine',
      'Intermediate',
      'Perform Ski Erg with controlled tempo, full range of motion, and stable cardio engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Sled Drag',
      'Cardio',
      'Cardio',
      array['Legs']::text[],
      'Machine',
      'Intermediate',
      'Perform Sled Drag with controlled tempo, full range of motion, and stable cardio engagement using machine.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      '90/90 Hip Switch',
      'Mobility',
      'Mobility',
      array['Hips']::text[],
      'Bodyweight',
      'Beginner',
      'Perform 90/90 Hip Switch with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Ankle Circles',
      'Mobility',
      'Mobility',
      array['Ankles']::text[],
      'Bodyweight',
      'Beginner',
      'Lift one foot and draw slow circles through the ankle in both directions.',
      'Useful before squats, lunges, and running.'
    ),
    (
      'Ankle Dorsiflexion Stretch',
      'Mobility',
      'Mobility',
      array['Ankles']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Ankle Dorsiflexion Stretch with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Band Pull-Apart',
      'Mobility',
      'Mobility',
      array['Rear Delts', 'Upper Back']::text[],
      'Resistance Band',
      'Beginner',
      'Hold a band at shoulder width and pull it apart until it touches the chest.',
      'Excellent for shoulder health before pressing sessions.'
    ),
    (
      'Calf Foam Roll',
      'Mobility',
      'Mobility',
      array['Calves']::text[],
      'Foam Roller',
      'Beginner',
      'Perform Calf Foam Roll with controlled tempo, full range of motion, and stable mobility engagement using foam roller.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Cat-Cow',
      'Mobility',
      'Mobility',
      array['Spine']::text[],
      'Bodyweight',
      'Beginner',
      'On all fours, alternate between spinal flexion and extension in a slow, controlled rhythm.',
      'Move segment by segment through the thoracic and lumbar spine.'
    ),
    (
      'Child''s Pose',
      'Mobility',
      'Mobility',
      array['Back']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Child''s Pose with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Couch Stretch',
      'Mobility',
      'Mobility',
      array['Hip Flexors']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Couch Stretch with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Cross-Body Shoulder Stretch',
      'Mobility',
      'Mobility',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Cross-Body Shoulder Stretch with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Deep Squat Hold',
      'Mobility',
      'Mobility',
      array['Ankles', 'Hips']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Deep Squat Hold with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Doorway Chest Stretch',
      'Mobility',
      'Mobility',
      array['Chest']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Doorway Chest Stretch with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Downward-Facing Dog',
      'Mobility',
      'Mobility',
      array['Hamstrings', 'Calves', 'Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'From all fours, lift hips upward into an inverted V and press heels toward the floor.',
      'Bend the knees slightly if hamstring tightness limits position.'
    ),
    (
      'Figure-Four Stretch',
      'Mobility',
      'Mobility',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Figure-Four Stretch with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Glute Foam Roll',
      'Mobility',
      'Mobility',
      array['Glutes']::text[],
      'Foam Roller',
      'Beginner',
      'Perform Glute Foam Roll with controlled tempo, full range of motion, and stable mobility engagement using foam roller.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Hamstring Foam Roll',
      'Mobility',
      'Mobility',
      array['Hamstrings']::text[],
      'Foam Roller',
      'Beginner',
      'Perform Hamstring Foam Roll with controlled tempo, full range of motion, and stable mobility engagement using foam roller.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Hip CARs',
      'Mobility',
      'Mobility',
      array['Hips']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Hip CARs with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'IT Band Foam Roll',
      'Mobility',
      'Mobility',
      array['Hips']::text[],
      'Foam Roller',
      'Beginner',
      'Perform IT Band Foam Roll with controlled tempo, full range of motion, and stable mobility engagement using foam roller.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Jefferson Curl',
      'Mobility',
      'Mobility',
      array['Hamstrings']::text[],
      'Barbell',
      'Advanced',
      'Perform Jefferson Curl with controlled tempo, full range of motion, and stable mobility engagement using barbell.',
      'Prioritize technique over load and scale mobility volume as needed.'
    ),
    (
      'Kneeling Hip Flexor Stretch',
      'Mobility',
      'Mobility',
      array['Hip Flexors']::text[],
      'Bodyweight',
      'Beginner',
      'Kneel on one knee, tuck the pelvis, and gently shift forward until a stretch is felt in the front hip.',
      'Squeeze the glute on the kneeling side to deepen the stretch.'
    ),
    (
      'Lat Foam Roll',
      'Mobility',
      'Mobility',
      array['Lats']::text[],
      'Foam Roller',
      'Beginner',
      'Perform Lat Foam Roll with controlled tempo, full range of motion, and stable mobility engagement using foam roller.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Leg Swing',
      'Mobility',
      'Mobility',
      array['Hips']::text[],
      'Bodyweight',
      'Beginner',
      'Hold support and swing one leg forward and backward or side to side in a controlled arc.',
      'Gradually increase range without forcing height or speed.'
    ),
    (
      'Neck CARs',
      'Mobility',
      'Mobility',
      array['Neck']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Neck CARs with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Open Book Stretch',
      'Mobility',
      'Mobility',
      array['Thoracic Spine']::text[],
      'Bodyweight',
      'Beginner',
      'Lie on the side with knees bent, rotate the top arm open toward the floor behind you, and follow with the eyes.',
      'Keep knees stacked to isolate rotation through the upper back.'
    ),
    (
      'Overhead Triceps Stretch',
      'Mobility',
      'Mobility',
      array['Triceps']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Overhead Triceps Stretch with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Pass-Through',
      'Mobility',
      'Mobility',
      array['Shoulders']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Pass-Through with controlled tempo, full range of motion, and stable mobility engagement using resistance band.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Pigeon Stretch',
      'Mobility',
      'Mobility',
      array['Glutes', 'Hips']::text[],
      'Bodyweight',
      'Intermediate',
      'From a push-up position, bring one shin across the body and sit into the hip stretch.',
      'Keep the hips square and support body weight with hands as needed.'
    ),
    (
      'Prone Press-Up',
      'Mobility',
      'Mobility',
      array['Lower Back']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Prone Press-Up with controlled tempo, full range of motion, and stable mobility engagement using bodyweight.',
      'Start light, master form, and progress gradually on mobility training.'
    ),
    (
      'Quadriceps Foam Roll',
      'Mobility',
      'Mobility',
      array['Quads']::text[],
      'Foam Roller',
      'Beginner',
      'Roll slowly along the front of the thigh from hip to knee, pausing on tender spots.',
      'Spend 30-60 seconds per leg and breathe through tight areas.'
    ),
    (
      'Block Clean',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Block Clean with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Block Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Block Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Clean and Jerk',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Clean and Jerk with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Clean High Pull',
      'Olympic',
      'Olympic Lifts',
      array['Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Clean High Pull with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Clean Pull',
      'Olympic',
      'Olympic Lifts',
      array['Back', 'Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Clean Pull with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Double Kettlebell Clean',
      'Olympic',
      'Olympic Lifts',
      array['Legs']::text[],
      'Kettlebell',
      'Advanced',
      'Perform Double Kettlebell Clean with controlled tempo, full range of motion, and stable olympic lifts engagement using kettlebell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Dumbbell Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Shoulders']::text[],
      'Dumbbell',
      'Intermediate',
      'Perform Dumbbell Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using dumbbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Hang Clean',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Hang Clean with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Hang Power Clean',
      'Olympic',
      'Olympic Lifts',
      array['Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Hang Power Clean with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Hang Power Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Hang Power Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Hang Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Hang Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Kettlebell Clean',
      'Olympic',
      'Olympic Lifts',
      array['Legs']::text[],
      'Kettlebell',
      'Intermediate',
      'Perform Kettlebell Clean with controlled tempo, full range of motion, and stable olympic lifts engagement using kettlebell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Kettlebell Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Shoulders']::text[],
      'Kettlebell',
      'Advanced',
      'Perform Kettlebell Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using kettlebell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Muscle Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Shoulders']::text[],
      'Barbell',
      'Intermediate',
      'Perform Muscle Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Power Clean',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Power Clean with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Power Jerk',
      'Olympic',
      'Olympic Lifts',
      array['Triceps']::text[],
      'Barbell',
      'Advanced',
      'Perform Power Jerk with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Power Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Power Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Push Jerk',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Triceps']::text[],
      'Barbell',
      'Advanced',
      'Perform Push Jerk with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Snatch Pull',
      'Olympic',
      'Olympic Lifts',
      array['Back', 'Traps']::text[],
      'Barbell',
      'Advanced',
      'Perform Snatch Pull with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Split Jerk',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Shoulders']::text[],
      'Barbell',
      'Advanced',
      'Perform Split Jerk with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Squat Clean',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Core']::text[],
      'Barbell',
      'Advanced',
      'Perform Squat Clean with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Squat Snatch',
      'Olympic',
      'Olympic Lifts',
      array['Legs', 'Core']::text[],
      'Barbell',
      'Advanced',
      'Perform Squat Snatch with controlled tempo, full range of motion, and stable olympic lifts engagement using barbell.',
      'Prioritize technique over load and scale olympic lifts volume as needed.'
    ),
    (
      'Archer Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Biceps']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Archer Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Australian Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Back']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Australian Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Start light, master form, and progress gradually on calisthenics training.'
    ),
    (
      'Back Lever',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Back Lever with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Bar Muscle-Up',
      'Calisthenics',
      'Calisthenics',
      array['Back', 'Triceps']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Bar Muscle-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Bear Crawl Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Bear Crawl Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Broad Jump',
      'Calisthenics',
      'Calisthenics',
      array['Glutes']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Broad Jump with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Butterfly Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Back']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Butterfly Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Chest to Bar Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Back']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Chest to Bar Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Chin-Up Negative',
      'Calisthenics',
      'Calisthenics',
      array['Biceps']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Chin-Up Negative with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Start light, master form, and progress gradually on calisthenics training.'
    ),
    (
      'Clapping Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Chest']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Clapping Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Close-Grip Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Triceps']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Close-Grip Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Start light, master form, and progress gradually on calisthenics training.'
    ),
    (
      'Deficit Handstand Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Deficit Handstand Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Depth Jump',
      'Calisthenics',
      'Calisthenics',
      array['Legs']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Depth Jump with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Dive Bomber Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Dive Bomber Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Explosive Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Chest']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Explosive Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Feet-Elevated Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Chest']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Feet-Elevated Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Freestanding Handstand Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Triceps']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Freestanding Handstand Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Front Lever Hold',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Front Lever Hold with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Front Lever Raise',
      'Calisthenics',
      'Calisthenics',
      array['Core', 'Lats']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Front Lever Raise with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Handstand Hold',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Handstand Hold with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Hindu Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Hindu Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Human Flag',
      'Calisthenics',
      'Calisthenics',
      array['Core', 'Lats']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Human Flag with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Jump Squat',
      'Calisthenics',
      'Calisthenics',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Jump Squat with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Start light, master form, and progress gradually on calisthenics training.'
    ),
    (
      'Kipping Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Back']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Kipping Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'L-Sit Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform L-Sit Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Mixed-Grip Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Forearms']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Mixed-Grip Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Pike Hold',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Pike Hold with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Planche Lean',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders', 'Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Planche Lean with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Pseudo Planche Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Pseudo Planche Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Pull-Up Negative',
      'Calisthenics',
      'Calisthenics',
      array['Back']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Pull-Up Negative with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Start light, master form, and progress gradually on calisthenics training.'
    ),
    (
      'Ring Muscle-Up',
      'Calisthenics',
      'Calisthenics',
      array['Back', 'Triceps']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Ring Muscle-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Ring Row',
      'Calisthenics',
      'Calisthenics',
      array['Back']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Ring Row with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Start light, master form, and progress gradually on calisthenics training.'
    ),
    (
      'Single-Arm Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Single-Arm Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Single-Leg Box Jump',
      'Calisthenics',
      'Calisthenics',
      array['Glutes']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Single-Leg Box Jump with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Skin the Cat',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Skin the Cat with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Spiderman Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Spiderman Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Squat Jump',
      'Calisthenics',
      'Calisthenics',
      array['Glutes']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Squat Jump with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Strict Toes to Bar',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Strict Toes to Bar with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Toes to Bar Kipping',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Toes to Bar Kipping with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Tuck Jump',
      'Calisthenics',
      'Calisthenics',
      array['Legs']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Tuck Jump with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Typewriter Pull-Up',
      'Calisthenics',
      'Calisthenics',
      array['Back']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Typewriter Pull-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Prioritize technique over load and scale calisthenics volume as needed.'
    ),
    (
      'Walking Push-Up',
      'Calisthenics',
      'Calisthenics',
      array['Core']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Walking Push-Up with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Wall Handstand Hold',
      'Calisthenics',
      'Calisthenics',
      array['Shoulders']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Wall Handstand Hold with controlled tempo, full range of motion, and stable calisthenics engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Active Hang',
      'Rehab',
      'Rehab/Prehab',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Active Hang with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Ankle Eversion',
      'Rehab',
      'Rehab/Prehab',
      array['Ankles']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Ankle Eversion with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Ankle Inversion',
      'Rehab',
      'Rehab/Prehab',
      array['Ankles']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Ankle Inversion with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Clamshell',
      'Rehab',
      'Rehab/Prehab',
      array['Glutes']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Clamshell with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band External Rotation',
      'Rehab',
      'Rehab/Prehab',
      array['Rotator Cuff']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band External Rotation with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Face Pull',
      'Rehab',
      'Rehab/Prehab',
      array['Rear Delts']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Face Pull with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Good Morning',
      'Rehab',
      'Rehab/Prehab',
      array['Hamstrings']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Good Morning with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Hip Hinge',
      'Rehab',
      'Rehab/Prehab',
      array['Hamstrings']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Hip Hinge with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Internal Rotation',
      'Rehab',
      'Rehab/Prehab',
      array['Rotator Cuff']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Internal Rotation with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Monster Walk',
      'Rehab',
      'Rehab/Prehab',
      array['Glutes']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Monster Walk with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Pull-Apart Overhead',
      'Rehab',
      'Rehab/Prehab',
      array['Upper Back']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Pull-Apart Overhead with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Band Squat',
      'Rehab',
      'Rehab/Prehab',
      array['Quads']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Band Squat with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Box Step-Down',
      'Rehab',
      'Rehab/Prehab',
      array['Quads']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Box Step-Down with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Copenhagen Adduction',
      'Rehab',
      'Rehab/Prehab',
      array['Adductors']::text[],
      'Bodyweight',
      'Advanced',
      'Perform Copenhagen Adduction with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Prioritize technique over load and scale rehab/prehab volume as needed.'
    ),
    (
      'Copenhagen Isometric',
      'Rehab',
      'Rehab/Prehab',
      array['Adductors']::text[],
      'Bodyweight',
      'Intermediate',
      'Perform Copenhagen Isometric with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Brace the core, use consistent reps, and stop before form breaks down.'
    ),
    (
      'Dead Hang',
      'Rehab',
      'Rehab/Prehab',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Dead Hang with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Glute Activation Bridge',
      'Rehab',
      'Rehab/Prehab',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Glute Activation Bridge with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Heel Walk',
      'Rehab',
      'Rehab/Prehab',
      array['Shins']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Heel Walk with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Isometric Neck Extension',
      'Rehab',
      'Rehab/Prehab',
      array['Neck']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Isometric Neck Extension with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Isometric Neck Flexion',
      'Rehab',
      'Rehab/Prehab',
      array['Neck']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Isometric Neck Flexion with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Patellar Tendon Isometric',
      'Rehab',
      'Rehab/Prehab',
      array['Quads']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Patellar Tendon Isometric with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Pelvic Tilt',
      'Rehab',
      'Rehab/Prehab',
      array['Core']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Pelvic Tilt with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Prone Cobra Hold',
      'Rehab',
      'Rehab/Prehab',
      array['Lower Back']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Prone Cobra Hold with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Prone I Raise',
      'Rehab',
      'Rehab/Prehab',
      array['Lower Back']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Prone I Raise with controlled tempo, full range of motion, and stable rehab/prehab engagement using dumbbell.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Prone M Raise',
      'Rehab',
      'Rehab/Prehab',
      array['Rotator Cuff']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Prone M Raise with controlled tempo, full range of motion, and stable rehab/prehab engagement using dumbbell.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Quadruped Extension',
      'Rehab',
      'Rehab/Prehab',
      array['Lower Back']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Quadruped Extension with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Scapular Push-Up',
      'Rehab',
      'Rehab/Prehab',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Scapular Push-Up with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Scapular Wall Slide',
      'Rehab',
      'Rehab/Prehab',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Scapular Wall Slide with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Serratus Punch',
      'Rehab',
      'Rehab/Prehab',
      array['Shoulders']::text[],
      'Cable',
      'Beginner',
      'Perform Serratus Punch with controlled tempo, full range of motion, and stable rehab/prehab engagement using cable.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Serratus Wall Slide',
      'Rehab',
      'Rehab/Prehab',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Serratus Wall Slide with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Side-Lying Clamshell',
      'Rehab',
      'Rehab/Prehab',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Side-Lying Clamshell with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Side-Lying External Rotation',
      'Rehab',
      'Rehab/Prehab',
      array['Rotator Cuff']::text[],
      'Dumbbell',
      'Beginner',
      'Perform Side-Lying External Rotation with controlled tempo, full range of motion, and stable rehab/prehab engagement using dumbbell.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Side-Lying Hip Abduction',
      'Rehab',
      'Rehab/Prehab',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Side-Lying Hip Abduction with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Single-Leg Balance Hold',
      'Rehab',
      'Rehab/Prehab',
      array['Ankles']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Single-Leg Balance Hold with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Single-Leg RDL Bodyweight',
      'Rehab',
      'Rehab/Prehab',
      array['Hamstrings']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Single-Leg RDL Bodyweight with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Standing Hip Abduction Hold',
      'Rehab',
      'Rehab/Prehab',
      array['Glutes']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Standing Hip Abduction Hold with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Standing Hip Extension',
      'Rehab',
      'Rehab/Prehab',
      array['Glutes']::text[],
      'Cable',
      'Beginner',
      'Perform Standing Hip Extension with controlled tempo, full range of motion, and stable rehab/prehab engagement using cable.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Standing March Hold',
      'Rehab',
      'Rehab/Prehab',
      array['Hip Flexors']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Standing March Hold with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Supine Dead Bug Hold',
      'Rehab',
      'Rehab/Prehab',
      array['Core']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Supine Dead Bug Hold with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Tempo Squat Bodyweight',
      'Rehab',
      'Rehab/Prehab',
      array['Quads']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Tempo Squat Bodyweight with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Tibialis Band Pull',
      'Rehab',
      'Rehab/Prehab',
      array['Shins']::text[],
      'Resistance Band',
      'Beginner',
      'Perform Tibialis Band Pull with controlled tempo, full range of motion, and stable rehab/prehab engagement using resistance band.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Toe Walk',
      'Rehab',
      'Rehab/Prehab',
      array['Calves']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Toe Walk with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Wall Angel',
      'Rehab',
      'Rehab/Prehab',
      array['Shoulders']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Wall Angel with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Wall Sit Isometric',
      'Rehab',
      'Rehab/Prehab',
      array['Quads']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Wall Sit Isometric with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    ),
    (
      'Wrist Extension Stretch',
      'Rehab',
      'Rehab/Prehab',
      array['Forearms']::text[],
      'Bodyweight',
      'Beginner',
      'Perform Wrist Extension Stretch with controlled tempo, full range of motion, and stable rehab/prehab engagement using bodyweight.',
      'Start light, master form, and progress gradually on rehab/prehab training.'
    )
) as v(
  name,
  category,
  primary_muscle,
  secondary_muscles,
  equipment,
  difficulty,
  instructions,
  tips
)
on conflict (name) do nothing;
