/**
 * Generates lib/exercise-seed-enrichment.json for the top 50 standard exercises.
 * Run: node scripts/build-exercise-seed-enrichment.mjs
 */

import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const TOP_50 = [
  "Barbell Bench Press",
  "Incline Barbell Bench Press",
  "Dumbbell Bench Press",
  "Machine Chest Press",
  "Cable Crossover",
  "Dumbbell Fly",
  "Incline Dumbbell Press",
  "Barbell Back Squat",
  "Front Squat",
  "Goblet Squat",
  "Bulgarian Split Squat",
  "Hack Squat",
  "Smith Machine Squat",
  "Conventional Deadlift",
  "Romanian Deadlift",
  "Good Morning",
  "Barbell Overhead Press",
  "Arnold Press",
  "Landmine Press",
  "Dumbbell Lateral Raise",
  "Face Pull",
  "Pull-Up",
  "Chin-Up",
  "Machine Lat Pulldown",
  "Barbell Bent-Over Row",
  "Chest-Supported Row",
  "Seated Cable Row",
  "Pendlay Row",
  "Chest-Supported T-Bar Row",
  "Inverted Row",
  "Barbell Lunge",
  "Barbell Hip Thrust",
  "Glute Bridge",
  "Push-Up",
  "Front Plank",
  "Side Plank",
  "Dead Bug",
  "Barbell Biceps Curl",
  "Preacher Curl",
  "Cable Hammer Curl",
  "Cable Triceps Pushdown",
  "EZ-Bar Skull Crusher",
  "Cable Rope Triceps Extension",
  "Bench Dip",
  "Leg Press",
  "Lying Leg Curl",
  "Seated Leg Curl",
  "Leg Extension",
  "Standing Calf Raise",
  "Barbell Calf Raise",
]

function steps(...instructions) {
  return instructions.map((instruction, index) => ({
    step: index + 1,
    instruction,
  }))
}

function mistakes(...items) {
  return items.map(([title, description]) => ({ title, description }))
}

function tips(...items) {
  return items.map((tip) => ({ tip }))
}

const ENRICHMENT = {
  "Barbell Bench Press": {
    form_steps: steps(
      "Lie on the bench with eyes under the bar, feet flat, and a slight arch through the upper back.",
      "Grip the bar slightly wider than shoulder width and pull shoulder blades down and together.",
      "Unrack with straight wrists and hold the bar over mid-chest with control.",
      "Lower the bar to the lower chest or sternum with forearms vertical at the bottom.",
      "Drive through the floor, press the bar up and slightly back while keeping glutes on the bench.",
      "Lock out with shoulders stable and repeat without bouncing the bar off the chest.",
    ),
    common_mistakes: mistakes(
      ["Flaring elbows excessively", "This shifts stress to the shoulders. Keep elbows roughly 45–75° from the torso."],
      ["Bouncing the bar", "Momentum reduces tension and increases injury risk. Pause lightly on the chest."],
      ["Loose shoulder blades", "A weak upper-back setup reduces stability and pressing power."],
      ["Feet floating", "Unstable leg drive makes the lift harder to control and repeat."],
    ),
    coach_tips: tips(
      "Think 'bend the bar' to engage the lats and protect the shoulders.",
      "Use a consistent touch point on every rep for better technique carryover.",
      "Leg drive should be firm but should not lift the hips off the bench.",
      "Start with a weight you can control for clean sets before chasing load.",
    ),
  },

  "Incline Barbell Bench Press": {
    form_steps: steps(
      "Set the bench to 30–45° and position yourself with eyes under the bar.",
      "Retract the shoulder blades and plant feet firmly on the floor.",
      "Grip the bar slightly wider than shoulders and unrack over the upper chest.",
      "Lower under control to the upper chest or clavicle line.",
      "Press up and slightly back while keeping wrists stacked over elbows.",
      "Finish with a full lockout without shrugging the shoulders to the ears.",
    ),
    common_mistakes: mistakes(
      ["Bench angle too high", "Above 45° often turns the press into a shoulder-dominant movement."],
      ["Bar drifting toward the belly", "Keep the bar path over the upper chest for better pec engagement."],
      ["Elbows flaring wide", "This can irritate the shoulders on incline pressing."],
      ["Short range of motion", "Touch consistently and use a full controlled press."],
    ),
    coach_tips: tips(
      "30° often hits upper chest well without overloading the front delts.",
      "Use a spotter or safeties when training close to failure.",
      "Pause reps build control at the bottom position.",
      "Keep the chest tall through the whole set.",
    ),
  },

  "Dumbbell Bench Press": {
    form_steps: steps(
      "Sit with dumbbells on the thighs, lie back, and position weights at chest level.",
      "Set feet flat, retract shoulder blades, and press dumbbells over the chest.",
      "Lower with elbows at roughly 45° until upper arms are parallel to the floor.",
      "Keep wrists neutral and dumbbells over the elbows throughout.",
      "Press up and slightly inward without clanking the weights together.",
      "Maintain shoulder stability through the full lockout.",
    ),
    common_mistakes: mistakes(
      ["Dumbbells drifting apart", "This reduces chest tension and control."],
      ["Overstretching at the bottom", "Stop when upper arms are parallel unless mobility is excellent."],
      ["Feet unstable", "Drive through the floor to stay balanced on the bench."],
      ["Rushing the eccentric", "Controlled lowering improves muscle engagement and safety."],
    ),
    coach_tips: tips(
      "A slight inward arc at the top can improve pec contraction.",
      "Use a neutral or semi-pronated grip based on shoulder comfort.",
      "Start each rep from the same chest position for consistency.",
      "Great option when barbell pressing bothers the shoulders.",
    ),
  },

  "Machine Chest Press": {
    form_steps: steps(
      "Adjust the seat so handles align with mid-chest when seated.",
      "Place feet flat and press your upper back and head into the pad.",
      "Grip handles and retract shoulder blades lightly before starting.",
      "Press forward smoothly without locking elbows aggressively.",
      "Return under control until you feel a stretch across the chest.",
      "Keep shoulders down and repeat with the same range each rep.",
    ),
    common_mistakes: mistakes(
      ["Seat too low or high", "Poor alignment shifts load to shoulders or triceps."],
      ["Shrugging at lockout", "Keep shoulders depressed for better chest focus."],
      ["Banging the stack", "Control the return phase for more time under tension."],
      ["Half reps", "Use a full range that matches your shoulder mobility."],
    ),
    coach_tips: tips(
      "Use a 1–2 second squeeze at the top for hypertrophy work.",
      "Machine pressing is useful after heavy free-weight work.",
      "Keep wrists in line with forearms throughout.",
      "Add pauses at the bottom to remove momentum.",
    ),
  },

  "Cable Crossover": {
    form_steps: steps(
      "Set pulleys above shoulder height and step into a stable split or square stance.",
      "Grab handles with a slight forward lean and soft elbows.",
      "Begin with arms wide and chest tall, feeling a light stretch.",
      "Sweep hands down and together in front of the chest with control.",
      "Squeeze the chest at the bottom without rounding the upper back.",
      "Return slowly until you feel tension again without losing posture.",
    ),
    common_mistakes: mistakes(
      ["Turning it into a press", "Keep elbows slightly bent and focus on adduction."],
      ["Using too much body swing", "Stay stable so the chest does the work."],
      ["Overstretching behind the body", "Stop where you can maintain shoulder control."],
      ["Shrugging through the rep", "Keep shoulders down and chest lifted."],
    ),
    coach_tips: tips(
      "Think about hugging a barrel to improve the contraction.",
      "Low-to-high and high-to-low angles target different chest regions.",
      "Use lighter loads for clean execution and a strong squeeze.",
      "Pause briefly at peak contraction on hypertrophy sets.",
    ),
  },

  "Dumbbell Fly": {
    form_steps: steps(
      "Lie on a flat bench with dumbbells pressed up over the chest.",
      "Maintain a soft elbow bend that stays fixed throughout the rep.",
      "Open the arms in a wide arc until you feel a chest stretch.",
      "Keep shoulder blades pinched and wrists neutral.",
      "Sweep the dumbbells back together over the chest in the same arc.",
      "Squeeze the chest at the top without banging the weights together.",
    ),
    common_mistakes: mistakes(
      ["Bending and extending elbows", "This turns the fly into a press."],
      ["Lowering too deep", "Excess stretch can stress the shoulder capsule."],
      ["Speeding through reps", "Flyes work best with a controlled tempo."],
      ["Losing shoulder blade position", "Stay pinned to the bench through the set."],
    ),
    coach_tips: tips(
      "Imagine wrapping your arms around a large tree trunk.",
      "Use moderate loads; flyes are not a maximal strength lift.",
      "Stop 1–2 reps before form breaks on high-rep sets.",
      "Incline flyes emphasize the upper chest.",
    ),
  },

  "Incline Dumbbell Press": {
    form_steps: steps(
      "Set bench to 30–45° and sit with dumbbells on the thighs.",
      "Kick weights into place as you lie back with shoulder blades retracted.",
      "Press dumbbells over the upper chest with neutral wrists.",
      "Lower under control until upper arms are near parallel to the floor.",
      "Drive up and slightly inward while keeping elbows under the wrists.",
      "Lock out without letting shoulders roll forward.",
    ),
    common_mistakes: mistakes(
      ["Angle too steep", "High inclines shift emphasis away from the upper chest."],
      ["Elbows too wide", "Can irritate shoulders; keep a moderate elbow angle."],
      ["Asymmetric pressing", "Press both sides evenly for balanced development."],
      ["Short bottom range", "Use a consistent depth each rep."],
    ),
    coach_tips: tips(
      "Upper chest responds well to moderate reps and controlled eccentrics.",
      "Brace the core so the lower back stays supported on the incline.",
      "Use a spotter when training near failure with heavy dumbbells.",
      "Pair with flyes for a complete upper-chest session.",
    ),
  },

  "Barbell Back Squat": {
    form_steps: steps(
      "Set the bar on the upper traps or rear delts and grip the bar evenly.",
      "Brace the core, unrack, and take 2–3 steps back into your stance.",
      "Place feet shoulder-width or slightly wider with toes turned out moderately.",
      "Sit hips down and back while keeping the chest up and knees tracking over toes.",
      "Descend until thighs are at least parallel or to your controlled depth.",
      "Drive through mid-foot and stand tall without hyperextending the lower back.",
    ),
    common_mistakes: mistakes(
      ["Knees caving inward", "Actively push knees out in line with the toes."],
      ["Heels rising", "Reduce depth or improve ankle mobility before adding load."],
      ["Good-morning squat", "Keep the torso more upright and brace harder."],
      ["Bouncing out of the hole", "Control the bottom for better strength transfer."],
    ),
    coach_tips: tips(
      "Take a big breath and brace before each rep.",
      "Think 'spread the floor' to engage glutes and stabilize the knees.",
      "Film from the side to check bar path and depth consistency.",
      "Build volume gradually; recovery drives squat progress.",
    ),
  },

  "Front Squat": {
    form_steps: steps(
      "Set the bar in the front rack with elbows high and chest proud.",
      "Brace hard and unrack with a tall torso.",
      "Stand with feet shoulder-width and toes slightly out.",
      "Descend between the hips with elbows staying parallel to the floor.",
      "Keep knees forward and torso upright through the bottom.",
      "Stand up by driving through the whole foot and finishing tall.",
    ),
    common_mistakes: mistakes(
      ["Elbows dropping", "This causes the bar to roll and torso to collapse."],
      ["Excessive forward lean", "Stay upright to keep the bar over mid-foot."],
      ["Loose upper back", "A strong rack position is critical for front squats."],
      ["Rushing the descent", "Control builds better positions at the bottom."],
    ),
    coach_tips: tips(
      "Use a clean grip or straps if wrist mobility limits the rack.",
      "Front squats reward patience; prioritize position over load.",
      "Pause squats in the bottom improve upright torso strength.",
      "Pair with ankle and thoracic mobility work if elbows drop.",
    ),
  },

  "Goblet Squat": {
    form_steps: steps(
      "Hold a dumbbell or kettlebell at chest height with elbows pointing down.",
      "Stand with feet slightly wider than shoulder width and toes out.",
      "Brace the core and sit straight down between the hips.",
      "Keep the chest tall and elbows inside the knees at the bottom.",
      "Pause briefly if needed to maintain posture.",
      "Stand by driving through the feet and squeezing the glutes at the top.",
    ),
    common_mistakes: mistakes(
      ["Rounding the upper back", "Keep the weight close and chest lifted."],
      ["Knees collapsing", "Push knees out over the second and third toes."],
      ["Rising onto toes", "Stay balanced over mid-foot."],
      ["Using too much weight too soon", "Master depth and posture first."],
    ),
    coach_tips: tips(
      "Excellent teaching squat for bracing and upright torso.",
      "Use elbows to gently push knees out at the bottom.",
      "Elevate heels slightly if ankle mobility is limited.",
      "Great warm-up before barbell squat sessions.",
    ),
  },

  "Bulgarian Split Squat": {
    form_steps: steps(
      "Place rear foot on a bench and front foot far enough forward for balance.",
      "Stay tall through the torso and brace the core.",
      "Lower straight down until the front thigh is near parallel.",
      "Keep the front knee tracking over the foot, not caving inward.",
      "Drive through the front heel to stand without pushing off the back foot.",
      "Complete all reps on one side before switching legs.",
    ),
    common_mistakes: mistakes(
      ["Stance too short", "A short stance turns it into a quad-dominant lunge with poor balance."],
      ["Leaning excessively forward", "Some lean is fine, but stay controlled."],
      ["Rear foot doing the work", "Focus on the front leg driving the movement."],
      ["Bouncing at the bottom", "Use a controlled pause for better stimulus."],
    ),
    coach_tips: tips(
      "Hold dumbbells at sides or in a goblet position for progression.",
      "Use a pad under the rear knee if comfort is an issue.",
      "Slow eccentrics build single-leg strength effectively.",
      "Keep 90% of the load through the front leg.",
    ),
  },

  "Hack Squat": {
    form_steps: steps(
      "Position shoulders and back firmly against the pads.",
      "Place feet shoulder-width on the platform with toes slightly out.",
      "Unlock the machine and brace before descending.",
      "Lower until thighs reach parallel or your controlled depth.",
      "Keep knees tracking over toes and lower back against the pad.",
      "Press through the whole foot to extend without locking knees harshly.",
    ),
    common_mistakes: mistakes(
      ["Feet too low on the platform", "Can increase knee stress; adjust foot placement intentionally."],
      ["Hips lifting off the pad", "Reduce load and maintain back contact."],
      ["Short range of motion", "Use depth you can control consistently."],
      ["Rapid lockouts", "Finish reps smoothly for joint-friendly training."],
    ),
    coach_tips: tips(
      "Higher foot placement can emphasize glutes and hamstrings more.",
      "Use controlled tempos for hypertrophy blocks.",
      "Great for leg volume when lower back fatigue is a limiter.",
      "Warm up with lighter sets before heavy work.",
    ),
  },

  "Smith Machine Squat": {
    form_steps: steps(
      "Set feet slightly in front of the bar path for a natural squat angle.",
      "Position the bar across the upper back and grip evenly.",
      "Brace, unlock the bar, and set a stable stance.",
      "Descend with knees tracking over toes and chest up.",
      "Reach consistent depth without losing heel contact.",
      "Drive up through mid-foot along the fixed bar path.",
    ),
    common_mistakes: mistakes(
      ["Feet directly under the bar", "This often forces an awkward forward lean."],
      ["Passively riding the machine", "Still brace and control each rep."],
      ["Depth inconsistency", "Use the same bottom position every rep."],
      ["Ignoring knee alignment", "Track knees over toes even on a fixed path."],
    ),
    coach_tips: tips(
      "Use Smith squats for hypertrophy rather than max strength specificity.",
      "A slight foot-forward setup usually feels more natural.",
      "Pair with free-weight squats for balanced athletic development.",
      "Control the eccentric; do not drop into the bottom.",
    ),
  },

  "Conventional Deadlift": {
    form_steps: steps(
      "Stand with mid-foot under the bar and feet hip-width apart.",
      "Hinge and grip the bar just outside the legs with a flat back.",
      "Pull slack out of the bar, brace hard, and set lats tight.",
      "Push the floor away and keep the bar close to the shins and thighs.",
      "Stand tall by squeezing glutes without overextending the lower back.",
      "Lower under control or reset each rep depending on your training style.",
    ),
    common_mistakes: mistakes(
      ["Bar drifting forward", "A distant bar increases lower-back stress dramatically."],
      ["Hips shooting up first", "Raise chest and hips together off the floor."],
      ["Soft brace", "A weak brace reduces power and spinal stability."],
      ["Jerking the bar", "Pull tension before the rep starts."],
    ),
    coach_tips: tips(
      "Think 'protect the armpits' to engage the lats.",
      "Use straps on high-volume sets if grip limits leg and back work.",
      "Reset reps are great for beginners learning positions.",
      "Film from the side to check bar path and hip height.",
    ),
  },

  "Romanian Deadlift": {
    form_steps: steps(
      "Stand tall holding the bar at hip height with a shoulder-width stance.",
      "Softly unlock knees and initiate the rep by pushing hips back.",
      "Keep the bar close to the thighs and shins as you hinge.",
      "Maintain a neutral spine and feel tension in the hamstrings.",
      "Lower until you reach a strong stretch without rounding the back.",
      "Drive hips forward to stand tall and squeeze the glutes at the top.",
    ),
    common_mistakes: mistakes(
      ["Squatting the weight down", "This is a hip hinge, not a knee-dominant squat."],
      ["Rounding the lower back", "Stop the rep when form breaks; reduce range or load."],
      ["Bar drifting away", "Drag the bar along the legs for better leverage."],
      ["Overextending at the top", "Finish tall without leaning back excessively."],
    ),
    coach_tips: tips(
      "Slight knee bend stays constant; movement comes from the hips.",
      "3–4 second eccentrics are excellent for hamstring development.",
      "Dumbbell RDLs work well for learning the hinge pattern.",
      "Stop 1–2 reps before lower-back fatigue changes form.",
    ),
  },

  "Good Morning": {
    form_steps: steps(
      "Place the bar on the upper back as in a back squat.",
      "Stand with feet hip-width and brace the core hard.",
      "Unlock knees slightly and push hips back with a flat back.",
      "Hinge until the torso is near parallel or hamstrings limit range.",
      "Keep the bar over mid-foot and lats engaged.",
      "Drive hips forward to return to a tall standing position.",
    ),
    common_mistakes: mistakes(
      ["Rounding the spine", "Use conservative loads and prioritize a neutral back."],
      ["Bending knees too much", "Keep the movement hip-dominant."],
      ["Going too heavy too soon", "Build tolerance gradually; this is a advanced hinge."],
      ["Looking up excessively", "Keep neck neutral with the spine."],
    ),
    coach_tips: tips(
      "Start with an empty bar or light load to learn the pattern.",
      "Excellent accessory for deadlift and squat posterior-chain strength.",
      "Pause at the bottom to build control.",
      "Stop the set when speed or position degrades.",
    ),
  },

  "Barbell Overhead Press": {
    form_steps: steps(
      "Set the bar in the front rack with elbows slightly in front of the bar.",
      "Brace glutes and core, then press the bar straight up.",
      "Move your head back slightly so the bar can pass in a straight line.",
      "Lock out with biceps near the ears and ribs down.",
      "Bring the head through at the top without arching the lower back excessively.",
      "Lower under control back to the rack position.",
    ),
    common_mistakes: mistakes(
      ["Excessive lower-back arch", "Squeeze glutes and ribs down for a stable press."],
      ["Pressing around the face", "Move the head, not the bar path."],
      ["Flared elbows too wide", "Keep forearms vertical under the bar."],
      ["Soft rack position", "A strong start improves every rep."],
    ),
    coach_tips: tips(
      "Think 'press the ceiling' for a vertical bar path.",
      "Standing strict press builds full-body stability.",
      "Use micro-plates to progress overhead strength gradually.",
      "Seated variations reduce lower-body help for isolation work.",
    ),
  },

  "Arnold Press": {
    form_steps: steps(
      "Sit or stand with dumbbells at shoulder height, palms facing you.",
      "Press up while rotating palms to face forward at the top.",
      "Finish with arms extended and biceps near the ears.",
      "Reverse the rotation on the way down to the start position.",
      "Keep ribs down and avoid excessive back arch.",
      "Repeat with smooth, controlled rotation each rep.",
    ),
    common_mistakes: mistakes(
      ["Using momentum", "Controlled rotation improves shoulder engagement."],
      ["Overarching the lower back", "Brace the core throughout the set."],
      ["Short range at the bottom", "Return dumbbells to the same start height each rep."],
      ["Weights drifting forward", "Keep the press path close to the body."],
    ),
    coach_tips: tips(
      "Use moderate loads; rotation adds complexity.",
      "Great hypertrophy option for all delt heads.",
      "Seated versions reduce cheating from the legs.",
      "Pause briefly at the top for extra shoulder stimulus.",
    ),
  },

  "Landmine Press": {
    form_steps: steps(
      "Anchor one end of the bar in a landmine base or corner.",
      "Hold the free end at chest height with a staggered or square stance.",
      "Brace the core and angle the torso slightly forward if needed.",
      "Press the bar up and forward in a natural arc.",
      "Lock out without shrugging the shoulders to the ears.",
      "Lower under control back to the start position.",
    ),
    common_mistakes: mistakes(
      ["Overarching the lower back", "Brace and use leg drive appropriately."],
      ["Shrugging at lockout", "Finish with stable shoulders, not ear-level shrugs."],
      ["Uncontrolled arc", "Move smoothly through the landmine path."],
      ["Stance too narrow", "Use a base that supports balance and power."],
    ),
    coach_tips: tips(
      "Half-kneeling variations are great for core and shoulder stability.",
      "Friendly pressing option when overhead barbell work bothers shoulders.",
      "Single-arm presses challenge anti-rotation strength.",
      "Use for higher reps and controlled hypertrophy work.",
    ),
  },

  "Dumbbell Lateral Raise": {
    form_steps: steps(
      "Stand tall with dumbbells at your sides and a slight elbow bend.",
      "Lead with the elbows and raise arms out to the sides.",
      "Stop around shoulder height or slightly below if shoulders are irritable.",
      "Keep shoulders down and wrists neutral at the top.",
      "Lower slowly without swinging the torso.",
      "Repeat with the same controlled tempo each rep.",
    ),
    common_mistakes: mistakes(
      ["Shrugging the traps", "Keep shoulders depressed for medial delt focus."],
      ["Using too much body English", "Reduce load and isolate the delts."],
      ["Raising above shoulder height", "Higher is not always better for side delts."],
      ["Straight arms", "A soft elbow bend protects the joint."],
    ),
    coach_tips: tips(
      "Think 'pour the water' with pinkies slightly up for delt engagement.",
      "Light weight and high quality beats heavy swinging.",
      "Pause at the top on hypertrophy sets.",
      "Leaning away or cable variations change the resistance curve nicely.",
    ),
  },

  "Face Pull": {
    form_steps: steps(
      "Set a rope attachment at upper-chest to face height.",
      "Grip with thumbs toward you and step back into tension.",
      "Pull the rope toward the face while separating the hands.",
      "Finish with elbows high and shoulder blades squeezed together.",
      "Pause briefly with external rotation at the end.",
      "Return slowly without losing posture or shrugging.",
    ),
    common_mistakes: mistakes(
      ["Pulling too low", "Aim toward the forehead or upper face for rear delt and rotator cuff balance."],
      ["Using excessive load", "Face pulls work best with moderate weight and high quality."],
      ["Shrugging instead of retracting", "Focus on scapular retraction and external rotation."],
      ["Rushing reps", "Controlled tempo improves shoulder health benefits."],
    ),
    coach_tips: tips(
      "Use face pulls as a staple for shoulder health and posture.",
      "Higher reps (12–20) are usually most effective.",
      "Great between pressing sets as a movement break.",
      "Think 'pull apart and rotate' at the end.",
    ),
  },

  "Pull-Up": {
    form_steps: steps(
      "Hang from the bar with hands slightly wider than shoulders, palms away.",
      "Brace the core and set shoulders down slightly before pulling.",
      "Drive elbows down and back until the chin clears the bar.",
      "Keep chest lifted and avoid excessive kicking or swinging.",
      "Lower under control to a full hang without losing shoulder position.",
      "Reset tension before the next rep if needed.",
    ),
    common_mistakes: mistakes(
      ["Half reps", "Use full range or regress to assisted variations."],
      ["Excessive kipping for strength work", "Strict reps build more pulling strength."],
      ["Shrugging at the top", "Finish with lats and scapular depression."],
      ["Loose core", "Bracing reduces swinging and improves control."],
    ),
    coach_tips: tips(
      "Think 'elbows to ribs' to engage the lats.",
      "Scap pull-ups are a great activation drill before sets.",
      "Use bands or machines for volume when needed.",
      "Add weight only when strict reps are solid.",
    ),
  },

  "Chin-Up": {
    form_steps: steps(
      "Grip the bar shoulder-width with palms facing you.",
      "Start from a dead hang with shoulders engaged, not fully relaxed.",
      "Pull until the chin passes the bar with chest slightly lifted.",
      "Keep elbows tracking down and close to the body.",
      "Lower slowly to full extension under control.",
      "Maintain grip without excessive body swing.",
    ),
    common_mistakes: mistakes(
      ["Incomplete range", "Use assistance rather than cutting reps short."],
      ["Over-kipping", "Save kipping for skill work, not strength hypertrophy."],
      ["Neck craning", "Clear the bar with the chin, not by jutting the neck."],
      ["Grip too wide", "Shoulder-width often feels best for chin-ups."],
    ),
    coach_tips: tips(
      "Chin-ups emphasize biceps more than pull-ups.",
      "Use a false grip only if experienced and shoulder-stable.",
      "Eccentric-only reps build strength when full reps are hard.",
      "Pair with rows for balanced back development.",
    ),
  },

  "Machine Lat Pulldown": {
    form_steps: steps(
      "Adjust the thigh pad snugly and grip the bar slightly wider than shoulders.",
      "Sit tall with a slight lean back and chest up.",
      "Initiate by depressing shoulder blades, then pull elbows down.",
      "Bring the bar to the upper chest without jerking the torso.",
      "Squeeze lats at the bottom briefly.",
      "Return under control until elbows extend without shrugging up.",
    ),
    common_mistakes: mistakes(
      ["Pulling behind the neck", "Front pulldowns are safer for most athletes."],
      ["Using momentum", "Reduce load and control the rep."],
      ["Elbows flaring forward", "Drive elbows down toward the ribs."],
      ["Incomplete top stretch", "Allow shoulders to elevate under control at the top."],
    ),
    coach_tips: tips(
      "Think 'break the bar' to engage lats before pulling.",
      "Neutral-grip handles can be easier on wrists and shoulders.",
      "Pause at the bottom for hypertrophy emphasis.",
      "Use as a primary vertical pull when pull-ups are limited.",
    ),
  },

  "Barbell Bent-Over Row": {
    form_steps: steps(
      "Hinge with a flat back until the torso is near parallel to the floor.",
      "Grip the bar just outside the legs and brace the core.",
      "Pull the bar toward the lower ribs or upper abdomen.",
      "Drive elbows back and squeeze shoulder blades together.",
      "Lower under control without rounding the spine.",
      "Maintain the hinge angle throughout the set.",
    ),
    common_mistakes: mistakes(
      ["Standing too upright", "More horizontal torso increases lat and mid-back work."],
      ["Jerking with the lower back", "Use a load you can row without spinal movement."],
      ["Short range of motion", "Touch consistently and fully extend at the bottom."],
      ["Neck craning", "Keep neck neutral with the spine."],
    ),
    coach_tips: tips(
      "Pause reps build control off the floor and at the top.",
      "Use straps on heavy sets if grip limits back training.",
      "Chest-supported rows are a good regression when lower back fatigues.",
      "Think 'pull to the belly button' for lat emphasis.",
    ),
  },

  "Chest-Supported Row": {
    form_steps: steps(
      "Set the bench angle and lie chest-down with feet planted.",
      "Grab handles or dumbbells with shoulders hanging naturally.",
      "Pull elbows back and squeeze shoulder blades at the top.",
      "Keep chest glued to the pad throughout.",
      "Lower until arms are extended without shrugging up.",
      "Repeat with the same path and tempo.",
    ),
    common_mistakes: mistakes(
      ["Lifting chest off pad", "Support removes lower-back stress; keep contact."],
      ["Shrugging at the top", "Finish with scapular retraction, not traps."],
      ["Using momentum", "Controlled reps improve back engagement."],
      ["Grip inconsistent", "Use the same grip width for all reps in a set."],
    ),
    coach_tips: tips(
      "Great for high-volume back work without spinal loading.",
      "Pause at peak contraction for hypertrophy.",
      "Neutral grips often feel best on shoulders.",
      "Use as a main row when lower back is tired from deadlifts.",
    ),
  },

  "Seated Cable Row": {
    form_steps: steps(
      "Sit tall with feet on the platform and a slight knee bend.",
      "Grab the handle and start with arms extended and shoulders reaching forward.",
      "Pull the handle toward the lower ribs while sitting upright.",
      "Squeeze shoulder blades together without rocking the torso excessively.",
      "Control the return until arms are long and lats stretch.",
      "Maintain neutral spine through the whole set.",
    ),
    common_mistakes: mistakes(
      ["Excessive torso swing", "Reduce load and pull with the back."],
      ["Rounding the lower back", "Sit tall and brace lightly."],
      ["Shrugging at the finish", "Depress shoulders at the top."],
      ["Cutting the stretch short", "Allow a full reach at the start of each rep."],
    ),
    coach_tips: tips(
      "Wide grips emphasize upper back; close grips hit lats more.",
      "Pause and squeeze for 1–2 seconds on hypertrophy sets.",
      "Keep wrists neutral with the forearms.",
      "Great pairing with pulldowns for complete back volume.",
    ),
  },

  "Pendlay Row": {
    form_steps: steps(
      "Start with the bar on the floor and torso parallel to the ground.",
      "Grip the bar and brace hard with a flat back.",
      "Explosively pull the bar to the lower chest/upper abdomen.",
      "Keep elbows at roughly 45° and bar path tight to the body.",
      "Lower the bar back to a dead stop on the floor each rep.",
      "Reset brace and position before the next pull.",
    ),
    common_mistakes: mistakes(
      ["Torso rising during the pull", "Keep the hinge angle fixed."],
      ["Bouncing the bar", "Dead-stop reps are the point of Pendlay rows."],
      ["Using arms only", "Initiate with lats and upper back, not just elbows."],
      ["Grip too narrow or wide for your build", "Adjust for strong, pain-free pulling."],
    ),
    coach_tips: tips(
      "Excellent for power and strict back strength.",
      "Use on strength blocks with lower reps.",
      "Reset each rep to eliminate momentum.",
      "Film from the side to check torso angle.",
    ),
  },

  "Chest-Supported T-Bar Row": {
    form_steps: steps(
      "Lie chest-down on the pad and grip the handles evenly.",
      "Let shoulders hang with a neutral spine.",
      "Row the weight toward the lower chest with elbows driving back.",
      "Squeeze shoulder blades without lifting the chest.",
      "Lower under control to a full stretch.",
      "Keep head neutral and eyes toward the floor.",
    ),
    common_mistakes: mistakes(
      ["Short pulls", "Use a full stretch and strong contraction."],
      ["Shrugging traps", "Focus on mid-back and lats."],
      ["Uneven pull", "Drive both sides symmetrically."],
      ["Jerking the handle", "Smooth reps build better muscle tension."],
    ),
    coach_tips: tips(
      "Great heavy row when lower back needs relief.",
      "Use various grips to target different back regions.",
      "Pause reps increase time under tension.",
      "Control the eccentric on hypertrophy phases.",
    ),
  },

  "Inverted Row": {
    form_steps: steps(
      "Set a bar at waist to chest height and lie underneath it.",
      "Grip the bar shoulder-width with heels on the floor and body straight.",
      "Pull chest to the bar while keeping ribs down and glutes engaged.",
      "Drive elbows back and squeeze shoulder blades at the top.",
      "Lower until arms are extended without sagging hips.",
      "Maintain a plank-like body line throughout.",
    ),
    common_mistakes: mistakes(
      ["Sagging hips", "Squeeze glutes and brace core for a straight line."],
      ["Half reps", "Touch the bar or use a higher bar to regress."],
      ["Shrugging at the top", "Finish with depressed shoulders."],
      ["Flaring elbows too wide", "Keep a moderate elbow angle."],
    ),
    coach_tips: tips(
      "Elevate feet to increase difficulty.",
      "Excellent scalable pulling option for all levels.",
      "Use tempo reps for hypertrophy when bodyweight is easy.",
      "Great finisher after heavy barbell rows.",
    ),
  },

  "Barbell Lunge": {
    form_steps: steps(
      "Unrack the bar onto the upper back and stand tall.",
      "Take a controlled step forward into a long stride.",
      "Lower until the back knee approaches the floor and front thigh is near parallel.",
      "Keep front knee tracking over the foot and torso upright.",
      "Push through the front heel to return to standing or alternate steps.",
      "Maintain balance and brace throughout each rep.",
    ),
    common_mistakes: mistakes(
      ["Short steps", "A longer stride improves glute and quad balance."],
      ["Front knee collapsing inward", "Push knee out in line with toes."],
      ["Leaning forward excessively", "Stay tall with a braced core."],
      ["Pushing off the back foot only", "Drive through the front leg."],
    ),
    coach_tips: tips(
      "Walking lunges increase metabolic demand and coordination challenge.",
      "Use dumbbells if barbell balance limits load.",
      "Control the descent for knee-friendly training.",
      "Alternate legs or complete one side at a time consistently.",
    ),
  },

  "Barbell Hip Thrust": {
    form_steps: steps(
      "Sit with upper back on a bench and roll the bar over the hips.",
      "Place feet flat about shoulder-width with shins vertical at the top.",
      "Tuck the chin slightly and brace the core.",
      "Drive through the heels and squeeze glutes to extend hips.",
      "Finish with ribs down and shins near vertical without hyperextending the back.",
      "Lower under control until hips hover just above the floor.",
    ),
    common_mistakes: mistakes(
      ["Hyperextending the lower back", "Finish with glutes, not lumbar arch."],
      ["Feet too far forward or back", "Adjust so knees track over ankles at the top."],
      ["Pushing through toes", "Heel drive improves glute recruitment."],
      ["Rushing lockout", "Pause and squeeze at the top for better stimulus."],
    ),
    coach_tips: tips(
      "Use a pad on the bar for comfort.",
      "Chin tuck helps maintain a neutral rib position.",
      "Banded abduction between sets can enhance glute activation.",
      "Single-leg variations are great for unilateral glute work.",
    ),
  },

  "Glute Bridge": {
    form_steps: steps(
      "Lie on your back with knees bent and feet flat hip-width apart.",
      "Brace the core and press lower back gently toward the floor.",
      "Drive through the heels and squeeze glutes to lift hips.",
      "Finish with a straight line from knees to shoulders.",
      "Pause briefly at the top without arching the lower back.",
      "Lower slowly until hips lightly touch the floor.",
    ),
    common_mistakes: mistakes(
      ["Overarching at the top", "Ribs down; glutes do the work."],
      ["Pushing through toes", "Keep heels down for better glute focus."],
      ["Rushing reps", "Pauses improve activation for beginners."],
      ["Feet too far from hips", "Shins should be near vertical at the top."],
    ),
    coach_tips: tips(
      "Great activation drill before hip thrusts or squats.",
      "Add a band above knees to encourage knee stability.",
      "Single-leg bridges progress difficulty effectively.",
      "Hold top isometrics for endurance and control.",
    ),
  },

  "Push-Up": {
    form_steps: steps(
      "Place hands slightly wider than shoulders with fingers spread.",
      "Set a straight line from head to heels with ribs down.",
      "Lower the chest toward the floor while elbows track back about 45°.",
      "Keep core tight and hips level throughout.",
      "Press the floor away to return to full arm extension.",
      "Maintain the same body line on every rep.",
    ),
    common_mistakes: mistakes(
      ["Sagging hips", "Squeeze glutes and brace abs for a plank position."],
      ["Elbows flaring to 90°", "A moderate elbow angle is usually shoulder-friendlier."],
      ["Half reps", "Use an elevation to regress range if needed."],
      ["Head dropping", "Keep neck neutral with the spine."],
    ),
    coach_tips: tips(
      "Elevate hands to make push-ups easier; feet elevated to make harder.",
      "Think 'push the floor away' at the top for serratus engagement.",
      "Use tempo reps for hypertrophy when bodyweight is easy.",
      "Great daily movement for pressing endurance.",
    ),
  },

  "Front Plank": {
    form_steps: steps(
      "Place forearms on the floor with elbows under shoulders.",
      "Extend legs and set a straight line from head to heels.",
      "Brace abs, squeeze glutes, and press the floor away.",
      "Keep ribs down and breathe steadily without losing position.",
      "Hold the position for the prescribed time.",
      "Reset if hips sag or lower back arches.",
    ),
    common_mistakes: mistakes(
      ["Hips too high or low", "Aim for a neutral plank line."],
      ["Holding breath", "Breathe behind the brace for longer holds."],
      ["Shrugging shoulders", "Push the floor away and keep neck neutral."],
      ["Passive hanging in joints", "Create full-body tension."],
    ),
    coach_tips: tips(
      "RKC planks with max tension work well for short sets.",
      "Use side planks and carries to build complete core strength.",
      "Quality holds beat long sloppy holds.",
      "Great warm-up before squats and presses.",
    ),
  },

  "Side Plank": {
    form_steps: steps(
      "Lie on your side with elbow under shoulder and legs stacked or staggered.",
      "Lift hips to form a straight line from head to feet.",
      "Brace obliques and glutes while keeping shoulders stacked.",
      "Hold without letting hips rotate forward or back.",
      "Breathe steadily through the hold.",
      "Switch sides and match time or quality.",
    ),
    common_mistakes: mistakes(
      ["Hips dropping", "Reduce hold time and rebuild tension."],
      ["Rotating chest toward floor", "Stay square through the shoulders."],
      ["Elbow too far forward", "Stack joint for better support."],
      ["Holding breath", "Maintain breathing behind the brace."],
    ),
    coach_tips: tips(
      "Top leg lifts or reaches add difficulty.",
      "Essential for lateral core and hip stability.",
      "Use before single-leg work to improve control.",
      "Start with knee-down side planks if needed.",
    ),
  },

  "Dead Bug": {
    form_steps: steps(
      "Lie on your back with arms up and hips/knees at 90°.",
      "Press lower back gently into the floor and brace.",
      "Slowly extend opposite arm and leg without arching the back.",
      "Return under control and alternate sides.",
      "Keep ribs down and exhale on the extension.",
      "Move only as far as you can maintain back contact.",
    ),
    common_mistakes: mistakes(
      ["Lower back peeling off floor", "Shorten range until control returns."],
      ["Moving too fast", "Slow reps build anti-extension strength."],
      ["Holding breath", "Exhale through the hard part of the rep."],
      ["Neck tension", "Keep head relaxed on the floor."],
    ),
    coach_tips: tips(
      "Excellent beginner core drill with low spinal load.",
      "Band resistance around feet increases challenge.",
      "Use before heavy compound lifts to prime bracing.",
      "Quality reps beat large ranges with poor control.",
    ),
  },

  "Barbell Biceps Curl": {
    form_steps: steps(
      "Stand tall with shoulder-width stance and bar at thigh height.",
      "Grip the bar with palms up and elbows pinned near the torso.",
      "Curl the bar up without swinging the hips or shoulders.",
      "Squeeze biceps at the top with wrists neutral.",
      "Lower slowly until arms are fully extended.",
      "Keep upper arms stationary throughout the set.",
    ),
    common_mistakes: mistakes(
      ["Swinging the torso", "Reduce load and isolate the biceps."],
      ["Elbows drifting forward", "Keep elbows under shoulders for tension."],
      ["Wrist curling", "Forearms stay stable; biceps move the bar."],
      ["Partial reps only", "Use full controlled range unless doing partials intentionally."],
    ),
    coach_tips: tips(
      "Pause at the top for extra peak contraction.",
      "Slow eccentrics build arm size effectively.",
      "Avoid training curls to failure every session if elbows are sensitive.",
      "Supinate hard at the top without shrugging.",
    ),
  },

  "Preacher Curl": {
    form_steps: steps(
      "Sit at the preacher bench with chest against the pad.",
      "Place upper arms flat on the pad with armpits near the top edge.",
      "Curl the weight up without lifting elbows off the pad.",
      "Squeeze at the top without hyperextending elbows harshly.",
      "Lower slowly until near full extension without locking aggressively.",
      "Keep shoulders relaxed and down.",
    ),
    common_mistakes: mistakes(
      ["Lifting elbows off pad", "Removes tension from the biceps."],
      ["Using hips to cheat", "Stay seated and stable."],
      ["Dropping into the bottom", "Control the stretch phase."],
      ["Too much weight", "Preacher curls reward strict form."],
    ),
    coach_tips: tips(
      "Great for emphasizing the short head of the biceps.",
      "Use EZ-bar if wrists bother you on straight bars.",
      "Pause in the stretched position for advanced hypertrophy.",
      "Single-arm dumbbell versions help fix imbalances.",
    ),
  },

  "Cable Hammer Curl": {
    form_steps: steps(
      "Attach a rope or neutral handles at low pulley height.",
      "Stand tall with elbows at your sides and palms facing each other.",
      "Curl handles up without moving upper arms forward.",
      "Squeeze brachialis and forearms at the top.",
      "Lower under control to full extension.",
      "Keep shoulders stable throughout.",
    ),
    common_mistakes: mistakes(
      ["Swinging the body", "Use a load that allows strict reps."],
      ["Elbows flaring out", "Pin elbows to ribs for better isolation."],
      ["Rushing the negative", "Controlled lowering builds arm size."],
      ["Shrugging", "Keep traps quiet during the set."],
    ),
    coach_tips: tips(
      "Hammer curls build arm thickness and grip support.",
      "Cross-body hammer curls emphasize brachialis differently.",
      "Great pairing with standard curls for complete arm work.",
      "Use higher reps for pump-focused sessions.",
    ),
  },

  "Cable Triceps Pushdown": {
    form_steps: steps(
      "Set cable to high position with bar or rope attachment.",
      "Stand close with slight forward lean and elbows at your sides.",
      "Press down until arms are fully extended without locking harshly.",
      "Keep upper arms fixed and shoulders down.",
      "Squeeze triceps at the bottom briefly.",
      "Return under control until forearms are near parallel to the floor.",
    ),
    common_mistakes: mistakes(
      ["Elbows drifting forward", "Pin elbows to maintain triceps tension."],
      ["Using shoulders and lats", "Reduce load and isolate the triceps."],
      ["Wrist bending", "Keep wrists neutral through the press."],
      ["Half reps", "Use full range unless doing deliberate partials."],
    ),
    coach_tips: tips(
      "Rope pushdowns allow a strong end-range squeeze.",
      "Slight forward torso lean can improve stability.",
      "Great high-volume finisher after pressing.",
      "Pause reps at the bottom increase metabolic stress.",
    ),
  },

  "EZ-Bar Skull Crusher": {
    form_steps: steps(
      "Lie on a flat bench holding an EZ-bar above the chest with arms extended.",
      "Keep upper arms vertical or slightly angled toward the head.",
      "Lower the bar toward the forehead or just behind the head by bending elbows.",
      "Keep elbows from flaring excessively wide.",
      "Extend elbows to press the bar back to the start.",
      "Maintain shoulder stability and control the eccentric.",
    ),
    common_mistakes: mistakes(
      ["Elbows flaring wide", "Keep elbows tucked for safer long-head work."],
      ["Lowering to the face", "Control path toward forehead/skull area."],
      ["Using too much weight", "Elbow-friendly loads and strict reps win."],
      ["Turning it into a press", "Only the forearms should move."],
    ),
    coach_tips: tips(
      "EZ-bar angle reduces wrist and elbow stress for many athletes.",
      "Slow eccentrics are effective for triceps hypertrophy.",
      "Stop 1–2 reps before form breaks to protect elbows.",
      "Pair with pushdowns for complete triceps sessions.",
    ),
  },

  "Cable Rope Triceps Extension": {
    form_steps: steps(
      "Face away from a high pulley and hold the rope overhead.",
      "Set a staggered stance and brace the core.",
      "Keep upper arms near the ears as you extend elbows forward.",
      "Separate the rope ends slightly at lockout.",
      "Lower behind the head under control without moving upper arms.",
      "Repeat with smooth elbow hinge motion only.",
    ),
    common_mistakes: mistakes(
      ["Arching the lower back", "Brace and use a staggered stance for support."],
      ["Upper arms drifting forward", "Keep arms fixed to isolate triceps."],
      ["Using momentum", "Choose a load you can control overhead."],
      ["Incomplete stretch", "Allow a full bend behind the head if shoulders permit."],
    ),
    coach_tips: tips(
      "Excellent long-head triceps emphasis.",
      "Use seated variations for more stability.",
      "Keep ribs down to protect the lower back.",
      "Higher reps often feel best overhead.",
    ),
  },

  "Bench Dip": {
    form_steps: steps(
      "Place hands on a bench behind you with fingers forward.",
      "Extend legs with heels on the floor or another bench for difficulty.",
      "Lower by bending elbows until upper arms are near parallel to the floor.",
      "Keep shoulders down and chest slightly forward.",
      "Press up through the palms to extend elbows.",
      "Stop before shoulder discomfort or form breakdown.",
    ),
    common_mistakes: mistakes(
      ["Shoulders shrugging up", "Depress shoulders before and during reps."],
      ["Elbows flaring straight out", "A moderate tuck is usually safer."],
      ["Going too deep", "Reduce range if shoulders feel impinged."],
      ["Using legs too much", "Progress by elevating feet, not by kicking."],
    ),
    coach_tips: tips(
      "Great bodyweight triceps option when bars are busy.",
      "Keep torso close to the bench for better triceps focus.",
      "Add weight on the lap carefully when bodyweight is easy.",
      "Stop sets before sharp anterior shoulder pain.",
    ),
  },

  "Leg Press": {
    form_steps: steps(
      "Sit with back and hips firmly against the pad.",
      "Place feet shoulder-width on the platform where knees track comfortably.",
      "Unlock the sled and lower until knees bend to roughly 90° or controlled depth.",
      "Keep lower back glued to the pad throughout.",
      "Press through mid-foot to extend without locking knees aggressively.",
      "Breathe and brace each rep without bouncing at the bottom.",
    ),
    common_mistakes: mistakes(
      ["Lower back rounding at depth", "Reduce range or foot position until back stays flat."],
      ["Knees caving", "Drive knees out in line with toes."],
      ["Bouncing the bottom", "Control the eccentric for knee health."],
      ["Hands pushing knees", "Use leg drive, not arm assistance."],
    ),
    coach_tips: tips(
      "Higher foot placement can emphasize glutes and hamstrings.",
      "Lower foot placement emphasizes quads more.",
      "Use leg press for volume after squats, not as a back replacement.",
      "Single-leg press can address imbalances.",
    ),
  },

  "Lying Leg Curl": {
    form_steps: steps(
      "Lie face down with the pad on the lower calves/achilles area.",
      "Grip handles and keep hips pressed into the bench.",
      "Curl heels toward glutes without lifting the hips.",
      "Squeeze hamstrings at the top briefly.",
      "Lower under control to full extension.",
      "Keep toes relaxed or slightly pointed based on comfort.",
    ),
    common_mistakes: mistakes(
      ["Hips rising", "Reduces hamstring isolation; reduce load."],
      ["Using momentum", "Controlled reps build better hamstring development."],
      ["Partial reps", "Use full range unless doing intentional partials."],
      ["Pad too high on calves", "Adjust pad for strong leverage and comfort."],
    ),
    coach_tips: tips(
      "Pause at peak contraction for hypertrophy.",
      "Toes toward shins can increase hamstring feel for some athletes.",
      "Pair with RDLs for complete posterior-chain work.",
      "Slow eccentrics are especially effective here.",
    ),
  },

  "Seated Leg Curl": {
    form_steps: steps(
      "Adjust the machine so knees align with the axis and pad sits on lower shins.",
      "Sit tall with back against the pad and grab handles.",
      "Curl legs down and back by contracting hamstrings.",
      "Pause briefly at the bottom without rocking the torso.",
      "Return under control to the start position.",
      "Keep hips stable in the seat throughout.",
    ),
    common_mistakes: mistakes(
      ["Torso rocking", "Isolate hamstrings with a stable upper body."],
      ["Rushing reps", "Use a 2–3 second lowering phase periodically."],
      ["Incomplete extension", "Allow a full stretch at the top when safe."],
      ["Machine misalignment", "Knee joint should match the machine pivot."],
    ),
    coach_tips: tips(
      "Seated curls often allow a strong hamstring stretch.",
      "Great for high-rep hamstring hypertrophy.",
      "Alternate with lying curls for variety.",
      "Focus on squeezing at the bottom, not just moving weight.",
    ),
  },

  "Leg Extension": {
    form_steps: steps(
      "Adjust seat so knees align with machine axis and pad is on lower shins.",
      "Sit with back against pad and grip handles lightly.",
      "Extend knees to straighten legs without hyperextending harshly.",
      "Squeeze quads at the top for 1 second.",
      "Lower under control to about 90° or your comfortable stretch.",
      "Keep hips down in the seat throughout.",
    ),
    common_mistakes: mistakes(
      ["Kicking the weight up", "Use controlled extension, especially on the way down."],
      ["Hips lifting off seat", "Stay planted for true quad isolation."],
      ["Locking knees aggressively", "Finish strong but smoothly."],
      ["Using too much load", "Quality reps reduce knee stress for many users."],
    ),
    coach_tips: tips(
      "Great pre-exhaust or finisher for quads.",
      "Point toes up slightly to emphasize rectus femoris for some.",
      "Use higher reps for hypertrophy-focused blocks.",
      "Warm up knees gradually before heavy extensions.",
    ),
  },

  "Standing Calf Raise": {
    form_steps: steps(
      "Stand on a raised surface with balls of feet on the edge.",
      "Set feet hip-width with soft knees, not locked.",
      "Lower heels below the platform for a full stretch.",
      "Drive up onto the toes as high as possible.",
      "Pause briefly at the top contraction.",
      "Lower slowly under control and repeat.",
    ),
    common_mistakes: mistakes(
      ["Bouncing at the bottom", "Paused stretches improve calf growth."],
      ["Bending knees excessively", "Keep legs mostly straight for gastrocnemius focus."],
      ["Short range", "Use full stretch and full rise each rep."],
      ["Rushing reps", "Calves respond well to controlled tempo."],
    ),
    coach_tips: tips(
      "Straight-leg raises target gastrocnemius; bent-knee hits soleus more.",
      "Use 2–3 second lowers for hypertrophy.",
      "Train calves through full range multiple times per week if needed.",
      "Hold the top pause for 1–2 seconds on key sets.",
    ),
  },

  "Barbell Calf Raise": {
    form_steps: steps(
      "Place balls of feet on a block with bar supported on the upper back.",
      "Stand tall with soft knees and stable core.",
      "Lower heels for a deep stretch under control.",
      "Rise onto toes as high as possible and squeeze calves.",
      "Pause at the top without losing balance.",
      "Lower slowly and repeat with the same range.",
    ),
    common_mistakes: mistakes(
      ["Using momentum", "Reduce load for strict reps."],
      ["Cutting range short", "Full stretch and peak contraction matter."],
      ["Knees bouncing", "Keep legs mostly extended for gastroc work."],
      ["Forward lean", "Stay tall over the feet for balance."],
    ),
    coach_tips: tips(
      "Use safeties or a Smith machine if balance is limiting.",
      "Higher reps (10–20) are common for calf hypertrophy.",
      "Pair with seated calf work for soleus development.",
      "Slow eccentrics create soreness and growth stimulus.",
    ),
  },
}

if (Object.keys(ENRICHMENT).length !== TOP_50.length) {
  const missing = TOP_50.filter((name) => !ENRICHMENT[name])
  const extra = Object.keys(ENRICHMENT).filter((name) => !TOP_50.includes(name))
  console.error("Count mismatch", {
    expected: TOP_50.length,
    got: Object.keys(ENRICHMENT).length,
    missing,
    extra,
  })
  process.exit(1)
}

const outPath = join(root, "lib", "exercise-seed-enrichment.json")
writeFileSync(outPath, `${JSON.stringify(ENRICHMENT, null, 2)}\n`, "utf8")
console.log(`Wrote ${Object.keys(ENRICHMENT).length} enriched exercises to ${outPath}`)
