-- Enrich top 50 standard exercises with coaching content.

alter table public.exercises
  add column if not exists form_steps jsonb not null default '[]'::jsonb,
  add column if not exists common_mistakes jsonb not null default '[]'::jsonb,
  add column if not exists coach_tips jsonb not null default '[]'::jsonb,
  add column if not exists is_custom boolean not null default false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie on the bench with eyes under the bar, feet flat, and a slight arch through the upper back."},{"step":2,"instruction":"Grip the bar slightly wider than shoulder width and pull shoulder blades down and together."},{"step":3,"instruction":"Unrack with straight wrists and hold the bar over mid-chest with control."},{"step":4,"instruction":"Lower the bar to the lower chest or sternum with forearms vertical at the bottom."},{"step":5,"instruction":"Drive through the floor, press the bar up and slightly back while keeping glutes on the bench."},{"step":6,"instruction":"Lock out with shoulders stable and repeat without bouncing the bar off the chest."}]'::jsonb,
  common_mistakes = '[{"title":"Flaring elbows excessively","description":"This shifts stress to the shoulders. Keep elbows roughly 45–75° from the torso."},{"title":"Bouncing the bar","description":"Momentum reduces tension and increases injury risk. Pause lightly on the chest."},{"title":"Loose shoulder blades","description":"A weak upper-back setup reduces stability and pressing power."},{"title":"Feet floating","description":"Unstable leg drive makes the lift harder to control and repeat."}]'::jsonb,
  coach_tips = '[{"tip":"Think ''bend the bar'' to engage the lats and protect the shoulders."},{"tip":"Use a consistent touch point on every rep for better technique carryover."},{"tip":"Leg drive should be firm but should not lift the hips off the bench."},{"tip":"Start with a weight you can control for clean sets before chasing load."}]'::jsonb
where lower(name) = lower('Barbell Bench Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set the bench to 30–45° and position yourself with eyes under the bar."},{"step":2,"instruction":"Retract the shoulder blades and plant feet firmly on the floor."},{"step":3,"instruction":"Grip the bar slightly wider than shoulders and unrack over the upper chest."},{"step":4,"instruction":"Lower under control to the upper chest or clavicle line."},{"step":5,"instruction":"Press up and slightly back while keeping wrists stacked over elbows."},{"step":6,"instruction":"Finish with a full lockout without shrugging the shoulders to the ears."}]'::jsonb,
  common_mistakes = '[{"title":"Bench angle too high","description":"Above 45° often turns the press into a shoulder-dominant movement."},{"title":"Bar drifting toward the belly","description":"Keep the bar path over the upper chest for better pec engagement."},{"title":"Elbows flaring wide","description":"This can irritate the shoulders on incline pressing."},{"title":"Short range of motion","description":"Touch consistently and use a full controlled press."}]'::jsonb,
  coach_tips = '[{"tip":"30° often hits upper chest well without overloading the front delts."},{"tip":"Use a spotter or safeties when training close to failure."},{"tip":"Pause reps build control at the bottom position."},{"tip":"Keep the chest tall through the whole set."}]'::jsonb
where lower(name) = lower('Incline Barbell Bench Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Sit with dumbbells on the thighs, lie back, and position weights at chest level."},{"step":2,"instruction":"Set feet flat, retract shoulder blades, and press dumbbells over the chest."},{"step":3,"instruction":"Lower with elbows at roughly 45° until upper arms are parallel to the floor."},{"step":4,"instruction":"Keep wrists neutral and dumbbells over the elbows throughout."},{"step":5,"instruction":"Press up and slightly inward without clanking the weights together."},{"step":6,"instruction":"Maintain shoulder stability through the full lockout."}]'::jsonb,
  common_mistakes = '[{"title":"Dumbbells drifting apart","description":"This reduces chest tension and control."},{"title":"Overstretching at the bottom","description":"Stop when upper arms are parallel unless mobility is excellent."},{"title":"Feet unstable","description":"Drive through the floor to stay balanced on the bench."},{"title":"Rushing the eccentric","description":"Controlled lowering improves muscle engagement and safety."}]'::jsonb,
  coach_tips = '[{"tip":"A slight inward arc at the top can improve pec contraction."},{"tip":"Use a neutral or semi-pronated grip based on shoulder comfort."},{"tip":"Start each rep from the same chest position for consistency."},{"tip":"Great option when barbell pressing bothers the shoulders."}]'::jsonb
where lower(name) = lower('Dumbbell Bench Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Adjust the seat so handles align with mid-chest when seated."},{"step":2,"instruction":"Place feet flat and press your upper back and head into the pad."},{"step":3,"instruction":"Grip handles and retract shoulder blades lightly before starting."},{"step":4,"instruction":"Press forward smoothly without locking elbows aggressively."},{"step":5,"instruction":"Return under control until you feel a stretch across the chest."},{"step":6,"instruction":"Keep shoulders down and repeat with the same range each rep."}]'::jsonb,
  common_mistakes = '[{"title":"Seat too low or high","description":"Poor alignment shifts load to shoulders or triceps."},{"title":"Shrugging at lockout","description":"Keep shoulders depressed for better chest focus."},{"title":"Banging the stack","description":"Control the return phase for more time under tension."},{"title":"Half reps","description":"Use a full range that matches your shoulder mobility."}]'::jsonb,
  coach_tips = '[{"tip":"Use a 1–2 second squeeze at the top for hypertrophy work."},{"tip":"Machine pressing is useful after heavy free-weight work."},{"tip":"Keep wrists in line with forearms throughout."},{"tip":"Add pauses at the bottom to remove momentum."}]'::jsonb
where lower(name) = lower('Machine Chest Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set pulleys above shoulder height and step into a stable split or square stance."},{"step":2,"instruction":"Grab handles with a slight forward lean and soft elbows."},{"step":3,"instruction":"Begin with arms wide and chest tall, feeling a light stretch."},{"step":4,"instruction":"Sweep hands down and together in front of the chest with control."},{"step":5,"instruction":"Squeeze the chest at the bottom without rounding the upper back."},{"step":6,"instruction":"Return slowly until you feel tension again without losing posture."}]'::jsonb,
  common_mistakes = '[{"title":"Turning it into a press","description":"Keep elbows slightly bent and focus on adduction."},{"title":"Using too much body swing","description":"Stay stable so the chest does the work."},{"title":"Overstretching behind the body","description":"Stop where you can maintain shoulder control."},{"title":"Shrugging through the rep","description":"Keep shoulders down and chest lifted."}]'::jsonb,
  coach_tips = '[{"tip":"Think about hugging a barrel to improve the contraction."},{"tip":"Low-to-high and high-to-low angles target different chest regions."},{"tip":"Use lighter loads for clean execution and a strong squeeze."},{"tip":"Pause briefly at peak contraction on hypertrophy sets."}]'::jsonb
where lower(name) = lower('Cable Crossover')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie on a flat bench with dumbbells pressed up over the chest."},{"step":2,"instruction":"Maintain a soft elbow bend that stays fixed throughout the rep."},{"step":3,"instruction":"Open the arms in a wide arc until you feel a chest stretch."},{"step":4,"instruction":"Keep shoulder blades pinched and wrists neutral."},{"step":5,"instruction":"Sweep the dumbbells back together over the chest in the same arc."},{"step":6,"instruction":"Squeeze the chest at the top without banging the weights together."}]'::jsonb,
  common_mistakes = '[{"title":"Bending and extending elbows","description":"This turns the fly into a press."},{"title":"Lowering too deep","description":"Excess stretch can stress the shoulder capsule."},{"title":"Speeding through reps","description":"Flyes work best with a controlled tempo."},{"title":"Losing shoulder blade position","description":"Stay pinned to the bench through the set."}]'::jsonb,
  coach_tips = '[{"tip":"Imagine wrapping your arms around a large tree trunk."},{"tip":"Use moderate loads; flyes are not a maximal strength lift."},{"tip":"Stop 1–2 reps before form breaks on high-rep sets."},{"tip":"Incline flyes emphasize the upper chest."}]'::jsonb
where lower(name) = lower('Dumbbell Fly')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set bench to 30–45° and sit with dumbbells on the thighs."},{"step":2,"instruction":"Kick weights into place as you lie back with shoulder blades retracted."},{"step":3,"instruction":"Press dumbbells over the upper chest with neutral wrists."},{"step":4,"instruction":"Lower under control until upper arms are near parallel to the floor."},{"step":5,"instruction":"Drive up and slightly inward while keeping elbows under the wrists."},{"step":6,"instruction":"Lock out without letting shoulders roll forward."}]'::jsonb,
  common_mistakes = '[{"title":"Angle too steep","description":"High inclines shift emphasis away from the upper chest."},{"title":"Elbows too wide","description":"Can irritate shoulders; keep a moderate elbow angle."},{"title":"Asymmetric pressing","description":"Press both sides evenly for balanced development."},{"title":"Short bottom range","description":"Use a consistent depth each rep."}]'::jsonb,
  coach_tips = '[{"tip":"Upper chest responds well to moderate reps and controlled eccentrics."},{"tip":"Brace the core so the lower back stays supported on the incline."},{"tip":"Use a spotter when training near failure with heavy dumbbells."},{"tip":"Pair with flyes for a complete upper-chest session."}]'::jsonb
where lower(name) = lower('Incline Dumbbell Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set the bar on the upper traps or rear delts and grip the bar evenly."},{"step":2,"instruction":"Brace the core, unrack, and take 2–3 steps back into your stance."},{"step":3,"instruction":"Place feet shoulder-width or slightly wider with toes turned out moderately."},{"step":4,"instruction":"Sit hips down and back while keeping the chest up and knees tracking over toes."},{"step":5,"instruction":"Descend until thighs are at least parallel or to your controlled depth."},{"step":6,"instruction":"Drive through mid-foot and stand tall without hyperextending the lower back."}]'::jsonb,
  common_mistakes = '[{"title":"Knees caving inward","description":"Actively push knees out in line with the toes."},{"title":"Heels rising","description":"Reduce depth or improve ankle mobility before adding load."},{"title":"Good-morning squat","description":"Keep the torso more upright and brace harder."},{"title":"Bouncing out of the hole","description":"Control the bottom for better strength transfer."}]'::jsonb,
  coach_tips = '[{"tip":"Take a big breath and brace before each rep."},{"tip":"Think ''spread the floor'' to engage glutes and stabilize the knees."},{"tip":"Film from the side to check bar path and depth consistency."},{"tip":"Build volume gradually; recovery drives squat progress."}]'::jsonb
where lower(name) = lower('Barbell Back Squat')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set the bar in the front rack with elbows high and chest proud."},{"step":2,"instruction":"Brace hard and unrack with a tall torso."},{"step":3,"instruction":"Stand with feet shoulder-width and toes slightly out."},{"step":4,"instruction":"Descend between the hips with elbows staying parallel to the floor."},{"step":5,"instruction":"Keep knees forward and torso upright through the bottom."},{"step":6,"instruction":"Stand up by driving through the whole foot and finishing tall."}]'::jsonb,
  common_mistakes = '[{"title":"Elbows dropping","description":"This causes the bar to roll and torso to collapse."},{"title":"Excessive forward lean","description":"Stay upright to keep the bar over mid-foot."},{"title":"Loose upper back","description":"A strong rack position is critical for front squats."},{"title":"Rushing the descent","description":"Control builds better positions at the bottom."}]'::jsonb,
  coach_tips = '[{"tip":"Use a clean grip or straps if wrist mobility limits the rack."},{"tip":"Front squats reward patience; prioritize position over load."},{"tip":"Pause squats in the bottom improve upright torso strength."},{"tip":"Pair with ankle and thoracic mobility work if elbows drop."}]'::jsonb
where lower(name) = lower('Front Squat')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Hold a dumbbell or kettlebell at chest height with elbows pointing down."},{"step":2,"instruction":"Stand with feet slightly wider than shoulder width and toes out."},{"step":3,"instruction":"Brace the core and sit straight down between the hips."},{"step":4,"instruction":"Keep the chest tall and elbows inside the knees at the bottom."},{"step":5,"instruction":"Pause briefly if needed to maintain posture."},{"step":6,"instruction":"Stand by driving through the feet and squeezing the glutes at the top."}]'::jsonb,
  common_mistakes = '[{"title":"Rounding the upper back","description":"Keep the weight close and chest lifted."},{"title":"Knees collapsing","description":"Push knees out over the second and third toes."},{"title":"Rising onto toes","description":"Stay balanced over mid-foot."},{"title":"Using too much weight too soon","description":"Master depth and posture first."}]'::jsonb,
  coach_tips = '[{"tip":"Excellent teaching squat for bracing and upright torso."},{"tip":"Use elbows to gently push knees out at the bottom."},{"tip":"Elevate heels slightly if ankle mobility is limited."},{"tip":"Great warm-up before barbell squat sessions."}]'::jsonb
where lower(name) = lower('Goblet Squat')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Place rear foot on a bench and front foot far enough forward for balance."},{"step":2,"instruction":"Stay tall through the torso and brace the core."},{"step":3,"instruction":"Lower straight down until the front thigh is near parallel."},{"step":4,"instruction":"Keep the front knee tracking over the foot, not caving inward."},{"step":5,"instruction":"Drive through the front heel to stand without pushing off the back foot."},{"step":6,"instruction":"Complete all reps on one side before switching legs."}]'::jsonb,
  common_mistakes = '[{"title":"Stance too short","description":"A short stance turns it into a quad-dominant lunge with poor balance."},{"title":"Leaning excessively forward","description":"Some lean is fine, but stay controlled."},{"title":"Rear foot doing the work","description":"Focus on the front leg driving the movement."},{"title":"Bouncing at the bottom","description":"Use a controlled pause for better stimulus."}]'::jsonb,
  coach_tips = '[{"tip":"Hold dumbbells at sides or in a goblet position for progression."},{"tip":"Use a pad under the rear knee if comfort is an issue."},{"tip":"Slow eccentrics build single-leg strength effectively."},{"tip":"Keep 90% of the load through the front leg."}]'::jsonb
where lower(name) = lower('Bulgarian Split Squat')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Position shoulders and back firmly against the pads."},{"step":2,"instruction":"Place feet shoulder-width on the platform with toes slightly out."},{"step":3,"instruction":"Unlock the machine and brace before descending."},{"step":4,"instruction":"Lower until thighs reach parallel or your controlled depth."},{"step":5,"instruction":"Keep knees tracking over toes and lower back against the pad."},{"step":6,"instruction":"Press through the whole foot to extend without locking knees harshly."}]'::jsonb,
  common_mistakes = '[{"title":"Feet too low on the platform","description":"Can increase knee stress; adjust foot placement intentionally."},{"title":"Hips lifting off the pad","description":"Reduce load and maintain back contact."},{"title":"Short range of motion","description":"Use depth you can control consistently."},{"title":"Rapid lockouts","description":"Finish reps smoothly for joint-friendly training."}]'::jsonb,
  coach_tips = '[{"tip":"Higher foot placement can emphasize glutes and hamstrings more."},{"tip":"Use controlled tempos for hypertrophy blocks."},{"tip":"Great for leg volume when lower back fatigue is a limiter."},{"tip":"Warm up with lighter sets before heavy work."}]'::jsonb
where lower(name) = lower('Hack Squat')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set feet slightly in front of the bar path for a natural squat angle."},{"step":2,"instruction":"Position the bar across the upper back and grip evenly."},{"step":3,"instruction":"Brace, unlock the bar, and set a stable stance."},{"step":4,"instruction":"Descend with knees tracking over toes and chest up."},{"step":5,"instruction":"Reach consistent depth without losing heel contact."},{"step":6,"instruction":"Drive up through mid-foot along the fixed bar path."}]'::jsonb,
  common_mistakes = '[{"title":"Feet directly under the bar","description":"This often forces an awkward forward lean."},{"title":"Passively riding the machine","description":"Still brace and control each rep."},{"title":"Depth inconsistency","description":"Use the same bottom position every rep."},{"title":"Ignoring knee alignment","description":"Track knees over toes even on a fixed path."}]'::jsonb,
  coach_tips = '[{"tip":"Use Smith squats for hypertrophy rather than max strength specificity."},{"tip":"A slight foot-forward setup usually feels more natural."},{"tip":"Pair with free-weight squats for balanced athletic development."},{"tip":"Control the eccentric; do not drop into the bottom."}]'::jsonb
where lower(name) = lower('Smith Machine Squat')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Stand with mid-foot under the bar and feet hip-width apart."},{"step":2,"instruction":"Hinge and grip the bar just outside the legs with a flat back."},{"step":3,"instruction":"Pull slack out of the bar, brace hard, and set lats tight."},{"step":4,"instruction":"Push the floor away and keep the bar close to the shins and thighs."},{"step":5,"instruction":"Stand tall by squeezing glutes without overextending the lower back."},{"step":6,"instruction":"Lower under control or reset each rep depending on your training style."}]'::jsonb,
  common_mistakes = '[{"title":"Bar drifting forward","description":"A distant bar increases lower-back stress dramatically."},{"title":"Hips shooting up first","description":"Raise chest and hips together off the floor."},{"title":"Soft brace","description":"A weak brace reduces power and spinal stability."},{"title":"Jerking the bar","description":"Pull tension before the rep starts."}]'::jsonb,
  coach_tips = '[{"tip":"Think ''protect the armpits'' to engage the lats."},{"tip":"Use straps on high-volume sets if grip limits leg and back work."},{"tip":"Reset reps are great for beginners learning positions."},{"tip":"Film from the side to check bar path and hip height."}]'::jsonb
where lower(name) = lower('Conventional Deadlift')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Stand tall holding the bar at hip height with a shoulder-width stance."},{"step":2,"instruction":"Softly unlock knees and initiate the rep by pushing hips back."},{"step":3,"instruction":"Keep the bar close to the thighs and shins as you hinge."},{"step":4,"instruction":"Maintain a neutral spine and feel tension in the hamstrings."},{"step":5,"instruction":"Lower until you reach a strong stretch without rounding the back."},{"step":6,"instruction":"Drive hips forward to stand tall and squeeze the glutes at the top."}]'::jsonb,
  common_mistakes = '[{"title":"Squatting the weight down","description":"This is a hip hinge, not a knee-dominant squat."},{"title":"Rounding the lower back","description":"Stop the rep when form breaks; reduce range or load."},{"title":"Bar drifting away","description":"Drag the bar along the legs for better leverage."},{"title":"Overextending at the top","description":"Finish tall without leaning back excessively."}]'::jsonb,
  coach_tips = '[{"tip":"Slight knee bend stays constant; movement comes from the hips."},{"tip":"3–4 second eccentrics are excellent for hamstring development."},{"tip":"Dumbbell RDLs work well for learning the hinge pattern."},{"tip":"Stop 1–2 reps before lower-back fatigue changes form."}]'::jsonb
where lower(name) = lower('Romanian Deadlift')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Place the bar on the upper back as in a back squat."},{"step":2,"instruction":"Stand with feet hip-width and brace the core hard."},{"step":3,"instruction":"Unlock knees slightly and push hips back with a flat back."},{"step":4,"instruction":"Hinge until the torso is near parallel or hamstrings limit range."},{"step":5,"instruction":"Keep the bar over mid-foot and lats engaged."},{"step":6,"instruction":"Drive hips forward to return to a tall standing position."}]'::jsonb,
  common_mistakes = '[{"title":"Rounding the spine","description":"Use conservative loads and prioritize a neutral back."},{"title":"Bending knees too much","description":"Keep the movement hip-dominant."},{"title":"Going too heavy too soon","description":"Build tolerance gradually; this is a advanced hinge."},{"title":"Looking up excessively","description":"Keep neck neutral with the spine."}]'::jsonb,
  coach_tips = '[{"tip":"Start with an empty bar or light load to learn the pattern."},{"tip":"Excellent accessory for deadlift and squat posterior-chain strength."},{"tip":"Pause at the bottom to build control."},{"tip":"Stop the set when speed or position degrades."}]'::jsonb
where lower(name) = lower('Good Morning')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set the bar in the front rack with elbows slightly in front of the bar."},{"step":2,"instruction":"Brace glutes and core, then press the bar straight up."},{"step":3,"instruction":"Move your head back slightly so the bar can pass in a straight line."},{"step":4,"instruction":"Lock out with biceps near the ears and ribs down."},{"step":5,"instruction":"Bring the head through at the top without arching the lower back excessively."},{"step":6,"instruction":"Lower under control back to the rack position."}]'::jsonb,
  common_mistakes = '[{"title":"Excessive lower-back arch","description":"Squeeze glutes and ribs down for a stable press."},{"title":"Pressing around the face","description":"Move the head, not the bar path."},{"title":"Flared elbows too wide","description":"Keep forearms vertical under the bar."},{"title":"Soft rack position","description":"A strong start improves every rep."}]'::jsonb,
  coach_tips = '[{"tip":"Think ''press the ceiling'' for a vertical bar path."},{"tip":"Standing strict press builds full-body stability."},{"tip":"Use micro-plates to progress overhead strength gradually."},{"tip":"Seated variations reduce lower-body help for isolation work."}]'::jsonb
where lower(name) = lower('Barbell Overhead Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Sit or stand with dumbbells at shoulder height, palms facing you."},{"step":2,"instruction":"Press up while rotating palms to face forward at the top."},{"step":3,"instruction":"Finish with arms extended and biceps near the ears."},{"step":4,"instruction":"Reverse the rotation on the way down to the start position."},{"step":5,"instruction":"Keep ribs down and avoid excessive back arch."},{"step":6,"instruction":"Repeat with smooth, controlled rotation each rep."}]'::jsonb,
  common_mistakes = '[{"title":"Using momentum","description":"Controlled rotation improves shoulder engagement."},{"title":"Overarching the lower back","description":"Brace the core throughout the set."},{"title":"Short range at the bottom","description":"Return dumbbells to the same start height each rep."},{"title":"Weights drifting forward","description":"Keep the press path close to the body."}]'::jsonb,
  coach_tips = '[{"tip":"Use moderate loads; rotation adds complexity."},{"tip":"Great hypertrophy option for all delt heads."},{"tip":"Seated versions reduce cheating from the legs."},{"tip":"Pause briefly at the top for extra shoulder stimulus."}]'::jsonb
where lower(name) = lower('Arnold Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Anchor one end of the bar in a landmine base or corner."},{"step":2,"instruction":"Hold the free end at chest height with a staggered or square stance."},{"step":3,"instruction":"Brace the core and angle the torso slightly forward if needed."},{"step":4,"instruction":"Press the bar up and forward in a natural arc."},{"step":5,"instruction":"Lock out without shrugging the shoulders to the ears."},{"step":6,"instruction":"Lower under control back to the start position."}]'::jsonb,
  common_mistakes = '[{"title":"Overarching the lower back","description":"Brace and use leg drive appropriately."},{"title":"Shrugging at lockout","description":"Finish with stable shoulders, not ear-level shrugs."},{"title":"Uncontrolled arc","description":"Move smoothly through the landmine path."},{"title":"Stance too narrow","description":"Use a base that supports balance and power."}]'::jsonb,
  coach_tips = '[{"tip":"Half-kneeling variations are great for core and shoulder stability."},{"tip":"Friendly pressing option when overhead barbell work bothers shoulders."},{"tip":"Single-arm presses challenge anti-rotation strength."},{"tip":"Use for higher reps and controlled hypertrophy work."}]'::jsonb
where lower(name) = lower('Landmine Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Stand tall with dumbbells at your sides and a slight elbow bend."},{"step":2,"instruction":"Lead with the elbows and raise arms out to the sides."},{"step":3,"instruction":"Stop around shoulder height or slightly below if shoulders are irritable."},{"step":4,"instruction":"Keep shoulders down and wrists neutral at the top."},{"step":5,"instruction":"Lower slowly without swinging the torso."},{"step":6,"instruction":"Repeat with the same controlled tempo each rep."}]'::jsonb,
  common_mistakes = '[{"title":"Shrugging the traps","description":"Keep shoulders depressed for medial delt focus."},{"title":"Using too much body English","description":"Reduce load and isolate the delts."},{"title":"Raising above shoulder height","description":"Higher is not always better for side delts."},{"title":"Straight arms","description":"A soft elbow bend protects the joint."}]'::jsonb,
  coach_tips = '[{"tip":"Think ''pour the water'' with pinkies slightly up for delt engagement."},{"tip":"Light weight and high quality beats heavy swinging."},{"tip":"Pause at the top on hypertrophy sets."},{"tip":"Leaning away or cable variations change the resistance curve nicely."}]'::jsonb
where lower(name) = lower('Dumbbell Lateral Raise')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set a rope attachment at upper-chest to face height."},{"step":2,"instruction":"Grip with thumbs toward you and step back into tension."},{"step":3,"instruction":"Pull the rope toward the face while separating the hands."},{"step":4,"instruction":"Finish with elbows high and shoulder blades squeezed together."},{"step":5,"instruction":"Pause briefly with external rotation at the end."},{"step":6,"instruction":"Return slowly without losing posture or shrugging."}]'::jsonb,
  common_mistakes = '[{"title":"Pulling too low","description":"Aim toward the forehead or upper face for rear delt and rotator cuff balance."},{"title":"Using excessive load","description":"Face pulls work best with moderate weight and high quality."},{"title":"Shrugging instead of retracting","description":"Focus on scapular retraction and external rotation."},{"title":"Rushing reps","description":"Controlled tempo improves shoulder health benefits."}]'::jsonb,
  coach_tips = '[{"tip":"Use face pulls as a staple for shoulder health and posture."},{"tip":"Higher reps (12–20) are usually most effective."},{"tip":"Great between pressing sets as a movement break."},{"tip":"Think ''pull apart and rotate'' at the end."}]'::jsonb
where lower(name) = lower('Face Pull')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Hang from the bar with hands slightly wider than shoulders, palms away."},{"step":2,"instruction":"Brace the core and set shoulders down slightly before pulling."},{"step":3,"instruction":"Drive elbows down and back until the chin clears the bar."},{"step":4,"instruction":"Keep chest lifted and avoid excessive kicking or swinging."},{"step":5,"instruction":"Lower under control to a full hang without losing shoulder position."},{"step":6,"instruction":"Reset tension before the next rep if needed."}]'::jsonb,
  common_mistakes = '[{"title":"Half reps","description":"Use full range or regress to assisted variations."},{"title":"Excessive kipping for strength work","description":"Strict reps build more pulling strength."},{"title":"Shrugging at the top","description":"Finish with lats and scapular depression."},{"title":"Loose core","description":"Bracing reduces swinging and improves control."}]'::jsonb,
  coach_tips = '[{"tip":"Think ''elbows to ribs'' to engage the lats."},{"tip":"Scap pull-ups are a great activation drill before sets."},{"tip":"Use bands or machines for volume when needed."},{"tip":"Add weight only when strict reps are solid."}]'::jsonb
where lower(name) = lower('Pull-Up')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Grip the bar shoulder-width with palms facing you."},{"step":2,"instruction":"Start from a dead hang with shoulders engaged, not fully relaxed."},{"step":3,"instruction":"Pull until the chin passes the bar with chest slightly lifted."},{"step":4,"instruction":"Keep elbows tracking down and close to the body."},{"step":5,"instruction":"Lower slowly to full extension under control."},{"step":6,"instruction":"Maintain grip without excessive body swing."}]'::jsonb,
  common_mistakes = '[{"title":"Incomplete range","description":"Use assistance rather than cutting reps short."},{"title":"Over-kipping","description":"Save kipping for skill work, not strength hypertrophy."},{"title":"Neck craning","description":"Clear the bar with the chin, not by jutting the neck."},{"title":"Grip too wide","description":"Shoulder-width often feels best for chin-ups."}]'::jsonb,
  coach_tips = '[{"tip":"Chin-ups emphasize biceps more than pull-ups."},{"tip":"Use a false grip only if experienced and shoulder-stable."},{"tip":"Eccentric-only reps build strength when full reps are hard."},{"tip":"Pair with rows for balanced back development."}]'::jsonb
where lower(name) = lower('Chin-Up')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Adjust the thigh pad snugly and grip the bar slightly wider than shoulders."},{"step":2,"instruction":"Sit tall with a slight lean back and chest up."},{"step":3,"instruction":"Initiate by depressing shoulder blades, then pull elbows down."},{"step":4,"instruction":"Bring the bar to the upper chest without jerking the torso."},{"step":5,"instruction":"Squeeze lats at the bottom briefly."},{"step":6,"instruction":"Return under control until elbows extend without shrugging up."}]'::jsonb,
  common_mistakes = '[{"title":"Pulling behind the neck","description":"Front pulldowns are safer for most athletes."},{"title":"Using momentum","description":"Reduce load and control the rep."},{"title":"Elbows flaring forward","description":"Drive elbows down toward the ribs."},{"title":"Incomplete top stretch","description":"Allow shoulders to elevate under control at the top."}]'::jsonb,
  coach_tips = '[{"tip":"Think ''break the bar'' to engage lats before pulling."},{"tip":"Neutral-grip handles can be easier on wrists and shoulders."},{"tip":"Pause at the bottom for hypertrophy emphasis."},{"tip":"Use as a primary vertical pull when pull-ups are limited."}]'::jsonb
where lower(name) = lower('Machine Lat Pulldown')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Hinge with a flat back until the torso is near parallel to the floor."},{"step":2,"instruction":"Grip the bar just outside the legs and brace the core."},{"step":3,"instruction":"Pull the bar toward the lower ribs or upper abdomen."},{"step":4,"instruction":"Drive elbows back and squeeze shoulder blades together."},{"step":5,"instruction":"Lower under control without rounding the spine."},{"step":6,"instruction":"Maintain the hinge angle throughout the set."}]'::jsonb,
  common_mistakes = '[{"title":"Standing too upright","description":"More horizontal torso increases lat and mid-back work."},{"title":"Jerking with the lower back","description":"Use a load you can row without spinal movement."},{"title":"Short range of motion","description":"Touch consistently and fully extend at the bottom."},{"title":"Neck craning","description":"Keep neck neutral with the spine."}]'::jsonb,
  coach_tips = '[{"tip":"Pause reps build control off the floor and at the top."},{"tip":"Use straps on heavy sets if grip limits back training."},{"tip":"Chest-supported rows are a good regression when lower back fatigues."},{"tip":"Think ''pull to the belly button'' for lat emphasis."}]'::jsonb
where lower(name) = lower('Barbell Bent-Over Row')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set the bench angle and lie chest-down with feet planted."},{"step":2,"instruction":"Grab handles or dumbbells with shoulders hanging naturally."},{"step":3,"instruction":"Pull elbows back and squeeze shoulder blades at the top."},{"step":4,"instruction":"Keep chest glued to the pad throughout."},{"step":5,"instruction":"Lower until arms are extended without shrugging up."},{"step":6,"instruction":"Repeat with the same path and tempo."}]'::jsonb,
  common_mistakes = '[{"title":"Lifting chest off pad","description":"Support removes lower-back stress; keep contact."},{"title":"Shrugging at the top","description":"Finish with scapular retraction, not traps."},{"title":"Using momentum","description":"Controlled reps improve back engagement."},{"title":"Grip inconsistent","description":"Use the same grip width for all reps in a set."}]'::jsonb,
  coach_tips = '[{"tip":"Great for high-volume back work without spinal loading."},{"tip":"Pause at peak contraction for hypertrophy."},{"tip":"Neutral grips often feel best on shoulders."},{"tip":"Use as a main row when lower back is tired from deadlifts."}]'::jsonb
where lower(name) = lower('Chest-Supported Row')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Sit tall with feet on the platform and a slight knee bend."},{"step":2,"instruction":"Grab the handle and start with arms extended and shoulders reaching forward."},{"step":3,"instruction":"Pull the handle toward the lower ribs while sitting upright."},{"step":4,"instruction":"Squeeze shoulder blades together without rocking the torso excessively."},{"step":5,"instruction":"Control the return until arms are long and lats stretch."},{"step":6,"instruction":"Maintain neutral spine through the whole set."}]'::jsonb,
  common_mistakes = '[{"title":"Excessive torso swing","description":"Reduce load and pull with the back."},{"title":"Rounding the lower back","description":"Sit tall and brace lightly."},{"title":"Shrugging at the finish","description":"Depress shoulders at the top."},{"title":"Cutting the stretch short","description":"Allow a full reach at the start of each rep."}]'::jsonb,
  coach_tips = '[{"tip":"Wide grips emphasize upper back; close grips hit lats more."},{"tip":"Pause and squeeze for 1–2 seconds on hypertrophy sets."},{"tip":"Keep wrists neutral with the forearms."},{"tip":"Great pairing with pulldowns for complete back volume."}]'::jsonb
where lower(name) = lower('Seated Cable Row')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Start with the bar on the floor and torso parallel to the ground."},{"step":2,"instruction":"Grip the bar and brace hard with a flat back."},{"step":3,"instruction":"Explosively pull the bar to the lower chest/upper abdomen."},{"step":4,"instruction":"Keep elbows at roughly 45° and bar path tight to the body."},{"step":5,"instruction":"Lower the bar back to a dead stop on the floor each rep."},{"step":6,"instruction":"Reset brace and position before the next pull."}]'::jsonb,
  common_mistakes = '[{"title":"Torso rising during the pull","description":"Keep the hinge angle fixed."},{"title":"Bouncing the bar","description":"Dead-stop reps are the point of Pendlay rows."},{"title":"Using arms only","description":"Initiate with lats and upper back, not just elbows."},{"title":"Grip too narrow or wide for your build","description":"Adjust for strong, pain-free pulling."}]'::jsonb,
  coach_tips = '[{"tip":"Excellent for power and strict back strength."},{"tip":"Use on strength blocks with lower reps."},{"tip":"Reset each rep to eliminate momentum."},{"tip":"Film from the side to check torso angle."}]'::jsonb
where lower(name) = lower('Pendlay Row')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie chest-down on the pad and grip the handles evenly."},{"step":2,"instruction":"Let shoulders hang with a neutral spine."},{"step":3,"instruction":"Row the weight toward the lower chest with elbows driving back."},{"step":4,"instruction":"Squeeze shoulder blades without lifting the chest."},{"step":5,"instruction":"Lower under control to a full stretch."},{"step":6,"instruction":"Keep head neutral and eyes toward the floor."}]'::jsonb,
  common_mistakes = '[{"title":"Short pulls","description":"Use a full stretch and strong contraction."},{"title":"Shrugging traps","description":"Focus on mid-back and lats."},{"title":"Uneven pull","description":"Drive both sides symmetrically."},{"title":"Jerking the handle","description":"Smooth reps build better muscle tension."}]'::jsonb,
  coach_tips = '[{"tip":"Great heavy row when lower back needs relief."},{"tip":"Use various grips to target different back regions."},{"tip":"Pause reps increase time under tension."},{"tip":"Control the eccentric on hypertrophy phases."}]'::jsonb
where lower(name) = lower('Chest-Supported T-Bar Row')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set a bar at waist to chest height and lie underneath it."},{"step":2,"instruction":"Grip the bar shoulder-width with heels on the floor and body straight."},{"step":3,"instruction":"Pull chest to the bar while keeping ribs down and glutes engaged."},{"step":4,"instruction":"Drive elbows back and squeeze shoulder blades at the top."},{"step":5,"instruction":"Lower until arms are extended without sagging hips."},{"step":6,"instruction":"Maintain a plank-like body line throughout."}]'::jsonb,
  common_mistakes = '[{"title":"Sagging hips","description":"Squeeze glutes and brace core for a straight line."},{"title":"Half reps","description":"Touch the bar or use a higher bar to regress."},{"title":"Shrugging at the top","description":"Finish with depressed shoulders."},{"title":"Flaring elbows too wide","description":"Keep a moderate elbow angle."}]'::jsonb,
  coach_tips = '[{"tip":"Elevate feet to increase difficulty."},{"tip":"Excellent scalable pulling option for all levels."},{"tip":"Use tempo reps for hypertrophy when bodyweight is easy."},{"tip":"Great finisher after heavy barbell rows."}]'::jsonb
where lower(name) = lower('Inverted Row')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Unrack the bar onto the upper back and stand tall."},{"step":2,"instruction":"Take a controlled step forward into a long stride."},{"step":3,"instruction":"Lower until the back knee approaches the floor and front thigh is near parallel."},{"step":4,"instruction":"Keep front knee tracking over the foot and torso upright."},{"step":5,"instruction":"Push through the front heel to return to standing or alternate steps."},{"step":6,"instruction":"Maintain balance and brace throughout each rep."}]'::jsonb,
  common_mistakes = '[{"title":"Short steps","description":"A longer stride improves glute and quad balance."},{"title":"Front knee collapsing inward","description":"Push knee out in line with toes."},{"title":"Leaning forward excessively","description":"Stay tall with a braced core."},{"title":"Pushing off the back foot only","description":"Drive through the front leg."}]'::jsonb,
  coach_tips = '[{"tip":"Walking lunges increase metabolic demand and coordination challenge."},{"tip":"Use dumbbells if barbell balance limits load."},{"tip":"Control the descent for knee-friendly training."},{"tip":"Alternate legs or complete one side at a time consistently."}]'::jsonb
where lower(name) = lower('Barbell Lunge')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Sit with upper back on a bench and roll the bar over the hips."},{"step":2,"instruction":"Place feet flat about shoulder-width with shins vertical at the top."},{"step":3,"instruction":"Tuck the chin slightly and brace the core."},{"step":4,"instruction":"Drive through the heels and squeeze glutes to extend hips."},{"step":5,"instruction":"Finish with ribs down and shins near vertical without hyperextending the back."},{"step":6,"instruction":"Lower under control until hips hover just above the floor."}]'::jsonb,
  common_mistakes = '[{"title":"Hyperextending the lower back","description":"Finish with glutes, not lumbar arch."},{"title":"Feet too far forward or back","description":"Adjust so knees track over ankles at the top."},{"title":"Pushing through toes","description":"Heel drive improves glute recruitment."},{"title":"Rushing lockout","description":"Pause and squeeze at the top for better stimulus."}]'::jsonb,
  coach_tips = '[{"tip":"Use a pad on the bar for comfort."},{"tip":"Chin tuck helps maintain a neutral rib position."},{"tip":"Banded abduction between sets can enhance glute activation."},{"tip":"Single-leg variations are great for unilateral glute work."}]'::jsonb
where lower(name) = lower('Barbell Hip Thrust')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie on your back with knees bent and feet flat hip-width apart."},{"step":2,"instruction":"Brace the core and press lower back gently toward the floor."},{"step":3,"instruction":"Drive through the heels and squeeze glutes to lift hips."},{"step":4,"instruction":"Finish with a straight line from knees to shoulders."},{"step":5,"instruction":"Pause briefly at the top without arching the lower back."},{"step":6,"instruction":"Lower slowly until hips lightly touch the floor."}]'::jsonb,
  common_mistakes = '[{"title":"Overarching at the top","description":"Ribs down; glutes do the work."},{"title":"Pushing through toes","description":"Keep heels down for better glute focus."},{"title":"Rushing reps","description":"Pauses improve activation for beginners."},{"title":"Feet too far from hips","description":"Shins should be near vertical at the top."}]'::jsonb,
  coach_tips = '[{"tip":"Great activation drill before hip thrusts or squats."},{"tip":"Add a band above knees to encourage knee stability."},{"tip":"Single-leg bridges progress difficulty effectively."},{"tip":"Hold top isometrics for endurance and control."}]'::jsonb
where lower(name) = lower('Glute Bridge')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Place hands slightly wider than shoulders with fingers spread."},{"step":2,"instruction":"Set a straight line from head to heels with ribs down."},{"step":3,"instruction":"Lower the chest toward the floor while elbows track back about 45°."},{"step":4,"instruction":"Keep core tight and hips level throughout."},{"step":5,"instruction":"Press the floor away to return to full arm extension."},{"step":6,"instruction":"Maintain the same body line on every rep."}]'::jsonb,
  common_mistakes = '[{"title":"Sagging hips","description":"Squeeze glutes and brace abs for a plank position."},{"title":"Elbows flaring to 90°","description":"A moderate elbow angle is usually shoulder-friendlier."},{"title":"Half reps","description":"Use an elevation to regress range if needed."},{"title":"Head dropping","description":"Keep neck neutral with the spine."}]'::jsonb,
  coach_tips = '[{"tip":"Elevate hands to make push-ups easier; feet elevated to make harder."},{"tip":"Think ''push the floor away'' at the top for serratus engagement."},{"tip":"Use tempo reps for hypertrophy when bodyweight is easy."},{"tip":"Great daily movement for pressing endurance."}]'::jsonb
where lower(name) = lower('Push-Up')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Place forearms on the floor with elbows under shoulders."},{"step":2,"instruction":"Extend legs and set a straight line from head to heels."},{"step":3,"instruction":"Brace abs, squeeze glutes, and press the floor away."},{"step":4,"instruction":"Keep ribs down and breathe steadily without losing position."},{"step":5,"instruction":"Hold the position for the prescribed time."},{"step":6,"instruction":"Reset if hips sag or lower back arches."}]'::jsonb,
  common_mistakes = '[{"title":"Hips too high or low","description":"Aim for a neutral plank line."},{"title":"Holding breath","description":"Breathe behind the brace for longer holds."},{"title":"Shrugging shoulders","description":"Push the floor away and keep neck neutral."},{"title":"Passive hanging in joints","description":"Create full-body tension."}]'::jsonb,
  coach_tips = '[{"tip":"RKC planks with max tension work well for short sets."},{"tip":"Use side planks and carries to build complete core strength."},{"tip":"Quality holds beat long sloppy holds."},{"tip":"Great warm-up before squats and presses."}]'::jsonb
where lower(name) = lower('Front Plank')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie on your side with elbow under shoulder and legs stacked or staggered."},{"step":2,"instruction":"Lift hips to form a straight line from head to feet."},{"step":3,"instruction":"Brace obliques and glutes while keeping shoulders stacked."},{"step":4,"instruction":"Hold without letting hips rotate forward or back."},{"step":5,"instruction":"Breathe steadily through the hold."},{"step":6,"instruction":"Switch sides and match time or quality."}]'::jsonb,
  common_mistakes = '[{"title":"Hips dropping","description":"Reduce hold time and rebuild tension."},{"title":"Rotating chest toward floor","description":"Stay square through the shoulders."},{"title":"Elbow too far forward","description":"Stack joint for better support."},{"title":"Holding breath","description":"Maintain breathing behind the brace."}]'::jsonb,
  coach_tips = '[{"tip":"Top leg lifts or reaches add difficulty."},{"tip":"Essential for lateral core and hip stability."},{"tip":"Use before single-leg work to improve control."},{"tip":"Start with knee-down side planks if needed."}]'::jsonb
where lower(name) = lower('Side Plank')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie on your back with arms up and hips/knees at 90°."},{"step":2,"instruction":"Press lower back gently into the floor and brace."},{"step":3,"instruction":"Slowly extend opposite arm and leg without arching the back."},{"step":4,"instruction":"Return under control and alternate sides."},{"step":5,"instruction":"Keep ribs down and exhale on the extension."},{"step":6,"instruction":"Move only as far as you can maintain back contact."}]'::jsonb,
  common_mistakes = '[{"title":"Lower back peeling off floor","description":"Shorten range until control returns."},{"title":"Moving too fast","description":"Slow reps build anti-extension strength."},{"title":"Holding breath","description":"Exhale through the hard part of the rep."},{"title":"Neck tension","description":"Keep head relaxed on the floor."}]'::jsonb,
  coach_tips = '[{"tip":"Excellent beginner core drill with low spinal load."},{"tip":"Band resistance around feet increases challenge."},{"tip":"Use before heavy compound lifts to prime bracing."},{"tip":"Quality reps beat large ranges with poor control."}]'::jsonb
where lower(name) = lower('Dead Bug')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Stand tall with shoulder-width stance and bar at thigh height."},{"step":2,"instruction":"Grip the bar with palms up and elbows pinned near the torso."},{"step":3,"instruction":"Curl the bar up without swinging the hips or shoulders."},{"step":4,"instruction":"Squeeze biceps at the top with wrists neutral."},{"step":5,"instruction":"Lower slowly until arms are fully extended."},{"step":6,"instruction":"Keep upper arms stationary throughout the set."}]'::jsonb,
  common_mistakes = '[{"title":"Swinging the torso","description":"Reduce load and isolate the biceps."},{"title":"Elbows drifting forward","description":"Keep elbows under shoulders for tension."},{"title":"Wrist curling","description":"Forearms stay stable; biceps move the bar."},{"title":"Partial reps only","description":"Use full controlled range unless doing partials intentionally."}]'::jsonb,
  coach_tips = '[{"tip":"Pause at the top for extra peak contraction."},{"tip":"Slow eccentrics build arm size effectively."},{"tip":"Avoid training curls to failure every session if elbows are sensitive."},{"tip":"Supinate hard at the top without shrugging."}]'::jsonb
where lower(name) = lower('Barbell Biceps Curl')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Sit at the preacher bench with chest against the pad."},{"step":2,"instruction":"Place upper arms flat on the pad with armpits near the top edge."},{"step":3,"instruction":"Curl the weight up without lifting elbows off the pad."},{"step":4,"instruction":"Squeeze at the top without hyperextending elbows harshly."},{"step":5,"instruction":"Lower slowly until near full extension without locking aggressively."},{"step":6,"instruction":"Keep shoulders relaxed and down."}]'::jsonb,
  common_mistakes = '[{"title":"Lifting elbows off pad","description":"Removes tension from the biceps."},{"title":"Using hips to cheat","description":"Stay seated and stable."},{"title":"Dropping into the bottom","description":"Control the stretch phase."},{"title":"Too much weight","description":"Preacher curls reward strict form."}]'::jsonb,
  coach_tips = '[{"tip":"Great for emphasizing the short head of the biceps."},{"tip":"Use EZ-bar if wrists bother you on straight bars."},{"tip":"Pause in the stretched position for advanced hypertrophy."},{"tip":"Single-arm dumbbell versions help fix imbalances."}]'::jsonb
where lower(name) = lower('Preacher Curl')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Attach a rope or neutral handles at low pulley height."},{"step":2,"instruction":"Stand tall with elbows at your sides and palms facing each other."},{"step":3,"instruction":"Curl handles up without moving upper arms forward."},{"step":4,"instruction":"Squeeze brachialis and forearms at the top."},{"step":5,"instruction":"Lower under control to full extension."},{"step":6,"instruction":"Keep shoulders stable throughout."}]'::jsonb,
  common_mistakes = '[{"title":"Swinging the body","description":"Use a load that allows strict reps."},{"title":"Elbows flaring out","description":"Pin elbows to ribs for better isolation."},{"title":"Rushing the negative","description":"Controlled lowering builds arm size."},{"title":"Shrugging","description":"Keep traps quiet during the set."}]'::jsonb,
  coach_tips = '[{"tip":"Hammer curls build arm thickness and grip support."},{"tip":"Cross-body hammer curls emphasize brachialis differently."},{"tip":"Great pairing with standard curls for complete arm work."},{"tip":"Use higher reps for pump-focused sessions."}]'::jsonb
where lower(name) = lower('Cable Hammer Curl')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Set cable to high position with bar or rope attachment."},{"step":2,"instruction":"Stand close with slight forward lean and elbows at your sides."},{"step":3,"instruction":"Press down until arms are fully extended without locking harshly."},{"step":4,"instruction":"Keep upper arms fixed and shoulders down."},{"step":5,"instruction":"Squeeze triceps at the bottom briefly."},{"step":6,"instruction":"Return under control until forearms are near parallel to the floor."}]'::jsonb,
  common_mistakes = '[{"title":"Elbows drifting forward","description":"Pin elbows to maintain triceps tension."},{"title":"Using shoulders and lats","description":"Reduce load and isolate the triceps."},{"title":"Wrist bending","description":"Keep wrists neutral through the press."},{"title":"Half reps","description":"Use full range unless doing deliberate partials."}]'::jsonb,
  coach_tips = '[{"tip":"Rope pushdowns allow a strong end-range squeeze."},{"tip":"Slight forward torso lean can improve stability."},{"tip":"Great high-volume finisher after pressing."},{"tip":"Pause reps at the bottom increase metabolic stress."}]'::jsonb
where lower(name) = lower('Cable Triceps Pushdown')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie on a flat bench holding an EZ-bar above the chest with arms extended."},{"step":2,"instruction":"Keep upper arms vertical or slightly angled toward the head."},{"step":3,"instruction":"Lower the bar toward the forehead or just behind the head by bending elbows."},{"step":4,"instruction":"Keep elbows from flaring excessively wide."},{"step":5,"instruction":"Extend elbows to press the bar back to the start."},{"step":6,"instruction":"Maintain shoulder stability and control the eccentric."}]'::jsonb,
  common_mistakes = '[{"title":"Elbows flaring wide","description":"Keep elbows tucked for safer long-head work."},{"title":"Lowering to the face","description":"Control path toward forehead/skull area."},{"title":"Using too much weight","description":"Elbow-friendly loads and strict reps win."},{"title":"Turning it into a press","description":"Only the forearms should move."}]'::jsonb,
  coach_tips = '[{"tip":"EZ-bar angle reduces wrist and elbow stress for many athletes."},{"tip":"Slow eccentrics are effective for triceps hypertrophy."},{"tip":"Stop 1–2 reps before form breaks to protect elbows."},{"tip":"Pair with pushdowns for complete triceps sessions."}]'::jsonb
where lower(name) = lower('EZ-Bar Skull Crusher')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Face away from a high pulley and hold the rope overhead."},{"step":2,"instruction":"Set a staggered stance and brace the core."},{"step":3,"instruction":"Keep upper arms near the ears as you extend elbows forward."},{"step":4,"instruction":"Separate the rope ends slightly at lockout."},{"step":5,"instruction":"Lower behind the head under control without moving upper arms."},{"step":6,"instruction":"Repeat with smooth elbow hinge motion only."}]'::jsonb,
  common_mistakes = '[{"title":"Arching the lower back","description":"Brace and use a staggered stance for support."},{"title":"Upper arms drifting forward","description":"Keep arms fixed to isolate triceps."},{"title":"Using momentum","description":"Choose a load you can control overhead."},{"title":"Incomplete stretch","description":"Allow a full bend behind the head if shoulders permit."}]'::jsonb,
  coach_tips = '[{"tip":"Excellent long-head triceps emphasis."},{"tip":"Use seated variations for more stability."},{"tip":"Keep ribs down to protect the lower back."},{"tip":"Higher reps often feel best overhead."}]'::jsonb
where lower(name) = lower('Cable Rope Triceps Extension')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Place hands on a bench behind you with fingers forward."},{"step":2,"instruction":"Extend legs with heels on the floor or another bench for difficulty."},{"step":3,"instruction":"Lower by bending elbows until upper arms are near parallel to the floor."},{"step":4,"instruction":"Keep shoulders down and chest slightly forward."},{"step":5,"instruction":"Press up through the palms to extend elbows."},{"step":6,"instruction":"Stop before shoulder discomfort or form breakdown."}]'::jsonb,
  common_mistakes = '[{"title":"Shoulders shrugging up","description":"Depress shoulders before and during reps."},{"title":"Elbows flaring straight out","description":"A moderate tuck is usually safer."},{"title":"Going too deep","description":"Reduce range if shoulders feel impinged."},{"title":"Using legs too much","description":"Progress by elevating feet, not by kicking."}]'::jsonb,
  coach_tips = '[{"tip":"Great bodyweight triceps option when bars are busy."},{"tip":"Keep torso close to the bench for better triceps focus."},{"tip":"Add weight on the lap carefully when bodyweight is easy."},{"tip":"Stop sets before sharp anterior shoulder pain."}]'::jsonb
where lower(name) = lower('Bench Dip')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Sit with back and hips firmly against the pad."},{"step":2,"instruction":"Place feet shoulder-width on the platform where knees track comfortably."},{"step":3,"instruction":"Unlock the sled and lower until knees bend to roughly 90° or controlled depth."},{"step":4,"instruction":"Keep lower back glued to the pad throughout."},{"step":5,"instruction":"Press through mid-foot to extend without locking knees aggressively."},{"step":6,"instruction":"Breathe and brace each rep without bouncing at the bottom."}]'::jsonb,
  common_mistakes = '[{"title":"Lower back rounding at depth","description":"Reduce range or foot position until back stays flat."},{"title":"Knees caving","description":"Drive knees out in line with toes."},{"title":"Bouncing the bottom","description":"Control the eccentric for knee health."},{"title":"Hands pushing knees","description":"Use leg drive, not arm assistance."}]'::jsonb,
  coach_tips = '[{"tip":"Higher foot placement can emphasize glutes and hamstrings."},{"tip":"Lower foot placement emphasizes quads more."},{"tip":"Use leg press for volume after squats, not as a back replacement."},{"tip":"Single-leg press can address imbalances."}]'::jsonb
where lower(name) = lower('Leg Press')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Lie face down with the pad on the lower calves/achilles area."},{"step":2,"instruction":"Grip handles and keep hips pressed into the bench."},{"step":3,"instruction":"Curl heels toward glutes without lifting the hips."},{"step":4,"instruction":"Squeeze hamstrings at the top briefly."},{"step":5,"instruction":"Lower under control to full extension."},{"step":6,"instruction":"Keep toes relaxed or slightly pointed based on comfort."}]'::jsonb,
  common_mistakes = '[{"title":"Hips rising","description":"Reduces hamstring isolation; reduce load."},{"title":"Using momentum","description":"Controlled reps build better hamstring development."},{"title":"Partial reps","description":"Use full range unless doing intentional partials."},{"title":"Pad too high on calves","description":"Adjust pad for strong leverage and comfort."}]'::jsonb,
  coach_tips = '[{"tip":"Pause at peak contraction for hypertrophy."},{"tip":"Toes toward shins can increase hamstring feel for some athletes."},{"tip":"Pair with RDLs for complete posterior-chain work."},{"tip":"Slow eccentrics are especially effective here."}]'::jsonb
where lower(name) = lower('Lying Leg Curl')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Adjust the machine so knees align with the axis and pad sits on lower shins."},{"step":2,"instruction":"Sit tall with back against the pad and grab handles."},{"step":3,"instruction":"Curl legs down and back by contracting hamstrings."},{"step":4,"instruction":"Pause briefly at the bottom without rocking the torso."},{"step":5,"instruction":"Return under control to the start position."},{"step":6,"instruction":"Keep hips stable in the seat throughout."}]'::jsonb,
  common_mistakes = '[{"title":"Torso rocking","description":"Isolate hamstrings with a stable upper body."},{"title":"Rushing reps","description":"Use a 2–3 second lowering phase periodically."},{"title":"Incomplete extension","description":"Allow a full stretch at the top when safe."},{"title":"Machine misalignment","description":"Knee joint should match the machine pivot."}]'::jsonb,
  coach_tips = '[{"tip":"Seated curls often allow a strong hamstring stretch."},{"tip":"Great for high-rep hamstring hypertrophy."},{"tip":"Alternate with lying curls for variety."},{"tip":"Focus on squeezing at the bottom, not just moving weight."}]'::jsonb
where lower(name) = lower('Seated Leg Curl')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Adjust seat so knees align with machine axis and pad is on lower shins."},{"step":2,"instruction":"Sit with back against pad and grip handles lightly."},{"step":3,"instruction":"Extend knees to straighten legs without hyperextending harshly."},{"step":4,"instruction":"Squeeze quads at the top for 1 second."},{"step":5,"instruction":"Lower under control to about 90° or your comfortable stretch."},{"step":6,"instruction":"Keep hips down in the seat throughout."}]'::jsonb,
  common_mistakes = '[{"title":"Kicking the weight up","description":"Use controlled extension, especially on the way down."},{"title":"Hips lifting off seat","description":"Stay planted for true quad isolation."},{"title":"Locking knees aggressively","description":"Finish strong but smoothly."},{"title":"Using too much load","description":"Quality reps reduce knee stress for many users."}]'::jsonb,
  coach_tips = '[{"tip":"Great pre-exhaust or finisher for quads."},{"tip":"Point toes up slightly to emphasize rectus femoris for some."},{"tip":"Use higher reps for hypertrophy-focused blocks."},{"tip":"Warm up knees gradually before heavy extensions."}]'::jsonb
where lower(name) = lower('Leg Extension')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Stand on a raised surface with balls of feet on the edge."},{"step":2,"instruction":"Set feet hip-width with soft knees, not locked."},{"step":3,"instruction":"Lower heels below the platform for a full stretch."},{"step":4,"instruction":"Drive up onto the toes as high as possible."},{"step":5,"instruction":"Pause briefly at the top contraction."},{"step":6,"instruction":"Lower slowly under control and repeat."}]'::jsonb,
  common_mistakes = '[{"title":"Bouncing at the bottom","description":"Paused stretches improve calf growth."},{"title":"Bending knees excessively","description":"Keep legs mostly straight for gastrocnemius focus."},{"title":"Short range","description":"Use full stretch and full rise each rep."},{"title":"Rushing reps","description":"Calves respond well to controlled tempo."}]'::jsonb,
  coach_tips = '[{"tip":"Straight-leg raises target gastrocnemius; bent-knee hits soleus more."},{"tip":"Use 2–3 second lowers for hypertrophy."},{"tip":"Train calves through full range multiple times per week if needed."},{"tip":"Hold the top pause for 1–2 seconds on key sets."}]'::jsonb
where lower(name) = lower('Standing Calf Raise')
  and is_custom = false;

update public.exercises
set
  form_steps = '[{"step":1,"instruction":"Place balls of feet on a block with bar supported on the upper back."},{"step":2,"instruction":"Stand tall with soft knees and stable core."},{"step":3,"instruction":"Lower heels for a deep stretch under control."},{"step":4,"instruction":"Rise onto toes as high as possible and squeeze calves."},{"step":5,"instruction":"Pause at the top without losing balance."},{"step":6,"instruction":"Lower slowly and repeat with the same range."}]'::jsonb,
  common_mistakes = '[{"title":"Using momentum","description":"Reduce load for strict reps."},{"title":"Cutting range short","description":"Full stretch and peak contraction matter."},{"title":"Knees bouncing","description":"Keep legs mostly extended for gastroc work."},{"title":"Forward lean","description":"Stay tall over the feet for balance."}]'::jsonb,
  coach_tips = '[{"tip":"Use safeties or a Smith machine if balance is limiting."},{"tip":"Higher reps (10–20) are common for calf hypertrophy."},{"tip":"Pair with seated calf work for soleus development."},{"tip":"Slow eccentrics create soreness and growth stimulus."}]'::jsonb
where lower(name) = lower('Barbell Calf Raise')
  and is_custom = false;
