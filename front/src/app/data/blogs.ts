export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured: boolean;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Dental Caries",
    excerpt:
      "Dental caries occurs when bacteria accumulate on the surface of your teeth and feed on sugars from your diet, producing acids that gradually damage the enamel.",
    content: `Dental caries occurs when bacteria accumulate on the surface of your teeth and feed on sugars from your diet. These bacteria produce acids that gradually damage the enamel (the outer protective layer of the tooth), leading to the formation of cavities (small holes in the tooth).

In the early stages, you may not notice any symptoms. As the condition progresses, you might experience:

- Sensitivity to hot or cold foods and drinks
- Pain while chewing
- Dark spots (brown or black) on the tooth
- Persistent bad breath

If left untreated, the decay can reach deeper layers of the tooth, including the nerve, causing severe pain and requiring more complex treatments such as a root canal or tooth extraction.

## Keep in Mind

- Tooth decay does not heal on its own
- Early detection makes treatment easier and less invasive
- Good daily oral hygiene is essential for prevention

## Common Risk Factors

- Frequent consumption of sugary foods and drinks
- Poor oral hygiene habits
- Going to sleep without brushing your teeth
- Dry mouth
- Not using fluoride toothpaste

## To Protect Your Teeth

- Brush twice daily for at least two minutes
- Floss daily to remove food particles between teeth
- Limit sugar intake, especially between meals
- Drink enough water throughout the day
- Visit your dentist regularly for check-ups

## 🟢 Immediate Advice (Now)

- Brush your teeth with fluoride toothpaste
- Use dental floss to clean between your teeth
- Rinse your mouth after eating, especially sugary foods
- Chew on the unaffected side if you feel pain

## 🟡 Avoid

- Frequent sugary snacks, especially before bedtime
- Soft drinks and sweetened beverages
- Chewing on the affected tooth
- Neglecting oral hygiene even if there is no pain

## 🚨 Red Flags (See a Dentist Immediately)

- Severe or persistent tooth pain
- Swelling in the gums or face
- Presence of pus or a bad taste in your mouth
- Extreme sensitivity to hot or cold
- Difficulty eating or opening your mouth`,
    author: "Ora AI",
    authorRole: "Dental Health Guide",
    date: "April 20, 2026",
    readTime: "5 min read",
    category: "Decay & Cavities",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    featured: true,
    tags: ["Caries", "Cavities", "Prevention"],
  },
  {
    id: 2,
    title: "Dental Calculus",
    excerpt:
      "Dental calculus, also known as tartar, is hardened plaque that forms on your teeth when plaque is not properly removed through daily brushing and flossing.",
    content: `Dental calculus, also known as tartar, is hardened plaque that forms on your teeth when plaque is not properly removed through daily brushing and flossing. Plaque is a soft, sticky film of bacteria, and when it stays on the teeth for too long, it mineralizes due to contact with saliva, turning into a hard deposit.

Unlike plaque, calculus cannot be removed at home with a toothbrush — it requires professional cleaning by a dentist.

Calculus can build up above the gum line (visible yellow or brown deposits) or below it, where it is more harmful and can lead to gum disease.

As calculus accumulates, you may notice:

- Rough or hardened deposits on your teeth
- Yellow or brown discoloration, especially near the gum line
- Bad breath
- Gum irritation or bleeding

If left untreated, calculus creates a perfect environment for more bacteria to grow, which can lead to gingivitis and eventually more serious gum disease (periodontitis), potentially causing gum recession and tooth loss.

## Common Causes and Risk Factors

- Poor oral hygiene (infrequent brushing and flossing)
- Not removing plaque regularly
- Smoking
- Dry mouth
- Lack of regular dental visits

## To Reduce the Risk of Calculus Buildup

- Brush your teeth twice daily using proper technique
- Floss daily to remove plaque between teeth
- Use an antibacterial mouthwash
- Maintain regular dental check-ups and cleanings
- Limit habits that contribute to plaque buildup

## 🟢 Immediate Advice (Now)

- Brush thoroughly, focusing on the gum line
- Use dental floss to clean between teeth
- Rinse with an antibacterial mouthwash
- Schedule a professional dental cleaning as soon as possible

## 🟡 Avoid

- Skipping brushing or flossing
- Relying only on mouthwash without brushing
- Ignoring visible buildup on your teeth
- Smoking or habits that worsen plaque accumulation

## 🚨 Red Flags (See a Dentist Immediately)

- Gums that bleed frequently during brushing
- Persistent bad breath that doesn't improve
- Swollen, red, or tender gums
- Noticeable hard deposits that keep increasing
- Gum recession or teeth appearing longer`,
    author: "Ora AI",
    authorRole: "Dental Health Guide",
    date: "April 15, 2026",
    readTime: "5 min read",
    category: "Gum Health",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    featured: false,
    tags: ["Calculus", "Tartar", "Cleaning"],
  },
  {
    id: 3,
    title: "Gingivitis",
    excerpt:
      "Gingivitis is the earliest stage of gum disease. It happens when plaque builds up along the gum line, causing inflammation and making gums more sensitive.",
    content: `Gingivitis is the earliest stage of gum disease. It happens when plaque (a sticky layer of bacteria) builds up along the gum line. These bacteria irritate the gums, causing inflammation and making them more sensitive and prone to bleeding.

The important point is that gingivitis is reversible if treated early. However, if ignored, it can progress into a more serious condition called periodontitis, which can lead to gum damage and even tooth loss.

You may notice symptoms such as:

- Bleeding gums while brushing or flossing
- Red or swollen gums
- Mild discomfort or tenderness
- Persistent bad breath
- Slight gum recession

## Common Causes

- Poor oral hygiene
- Plaque and tartar buildup
- Smoking
- Hormonal changes (such as pregnancy)
- Vitamin deficiencies (especially vitamin C)
- Certain medications that affect gum health

## If Gingivitis Is Not Treated

- Inflammation worsens over time
- Gums may start to recede
- Infection can spread to supporting bone structures
- It may eventually lead to tooth instability or loss

## To Maintain Healthy Gums

- Brush your teeth twice daily using proper technique
- Floss daily to remove plaque between teeth
- Use an antibacterial mouthwash
- Do not stop brushing even if gums bleed (be gentle instead)
- Reduce or quit smoking
- Maintain a healthy diet rich in vitamins, especially vitamin C

## 🟢 Immediate Advice (Now)

- Brush gently, focusing on the gum line
- Use dental floss daily even if there is mild bleeding
- Use an antibacterial mouthwash
- Try to reduce smoking immediately

## 🟡 Avoid

- Ignoring brushing due to bleeding gums
- Brushing too hard (it worsens irritation)
- Neglecting early symptoms
- Smoking or increasing tobacco use

## 🚨 Red Flags (See a Dentist Immediately)

- Persistent or heavy gum bleeding
- Increasing swelling or pain in the gums
- Strong, persistent bad breath
- Noticeable gum recession
- Feeling that teeth are becoming loose`,
    author: "Ora AI",
    authorRole: "Dental Health Guide",
    date: "April 10, 2026",
    readTime: "5 min read",
    category: "Gum Health",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    featured: true,
    tags: ["Gingivitis", "Gum Disease", "Inflammation"],
  },
  {
    id: 4,
    title: "Tooth Discoloration",
    excerpt:
      "Tooth discoloration refers to changes in the natural color of your teeth, making them appear yellow, brown, gray, or stained.",
    content: `Tooth discoloration refers to changes in the natural color of your teeth, making them appear yellow, brown, gray, or stained. Discoloration can affect the outer surface of the teeth (extrinsic stains) or occur within the inner structure of the tooth (intrinsic discoloration).

In most cases, tooth discoloration is not harmful, but it can affect appearance and confidence.

You may notice:

- Gradual yellowing of the teeth
- Brown or dark surface stains
- Uneven color between teeth
- Loss of natural brightness or shine

## Common Causes

- Frequent consumption of coffee, tea, and colored beverages
- Smoking or tobacco use
- Poor oral hygiene
- Natural aging (enamel thinning over time)
- Certain medications or medical conditions
- Excess fluoride exposure during tooth development

Tooth discoloration is usually a result of daily habits rather than a disease, but it may indicate poor oral care or lifestyle factors.

## To Improve and Prevent Discoloration

- Brush your teeth twice daily with fluoride toothpaste
- Floss daily to remove plaque between teeth
- Reduce intake of staining drinks and foods
- Rinse your mouth with water after consuming coffee, tea, or colored beverages
- Maintain regular professional dental cleanings
- Consider professional whitening treatments if recommended by a dentist

## 🟢 Immediate Advice (Now)

- Brush your teeth twice daily with fluoride toothpaste
- Rinse your mouth with water after coffee, tea, or colored drinks
- Use dental floss daily
- Schedule a professional dental cleaning if stains are visible

## 🟡 Avoid

- Smoking or tobacco use
- Excessive consumption of coffee, tea, or sugary colored drinks
- Ignoring daily oral hygiene
- Using harsh DIY whitening methods (such as lemon or excessive charcoal use)

## 🚨 Red Flags (See a Dentist Immediately)

- Sudden or rapid color change in teeth
- Dark gray or black discoloration inside a tooth
- Discoloration accompanied by pain or sensitivity
- Stains that do not improve after professional cleaning
- Suspicion of decay or internal tooth damage`,
    author: "Ora AI",
    authorRole: "Dental Health Guide",
    date: "April 5, 2026",
    readTime: "4 min read",
    category: "Cosmetic",
    image:
      "https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&fit=crop&w=800&q=80",
    featured: false,
    tags: ["Discoloration", "Whitening", "Stains"],
  },
  {
    id: 5,
    title: "Oral Ulcers",
    excerpt:
      "Oral ulcers are small, painful lesions that develop inside the mouth, commonly on the inner cheeks, lips, tongue, or gums.",
    content: `Oral ulcers are small, painful lesions that develop inside the mouth, commonly on the inner cheeks, lips, tongue, or gums. They are also known as canker sores (aphthous ulcers). These ulcers are usually not contagious and tend to heal on their own within 1 to 2 weeks.

They often appear as round or oval sores with a white or yellow center and a red border. Even though they are small, they can cause significant discomfort, especially when eating, drinking, or speaking.

You may notice:

- Pain or burning sensation in the mouth
- Difficulty eating spicy, salty, or acidic foods
- Small round sores inside the mouth
- Increased sensitivity in the affected area

## Common Causes

- Stress or fatigue
- Minor injuries inside the mouth (biting the cheek, sharp teeth, braces)
- Acidic or spicy foods
- Vitamin deficiencies (especially B12, iron, folate)
- Hormonal changes
- Weakened immune system

Most oral ulcers heal naturally, but proper care can reduce pain and speed up recovery.

## To Manage Symptoms and Support Healing

- Maintain gentle oral hygiene without irritating the sore
- Use saltwater rinses to soothe the area
- Stay hydrated
- Eat soft, non-irritating foods
- Use topical gels or oral pain relievers if needed (as advised by a pharmacist or doctor)

## 🟢 Immediate Advice (Now)

- Rinse your mouth with warm salt water 2–3 times daily
- Avoid spicy, acidic, or salty foods
- Use a soft toothbrush and brush gently
- Stay hydrated and rest if needed

## 🟡 Avoid

- Spicy, citrus, or acidic foods and drinks
- Touching or irritating the ulcer
- Alcohol-based mouthwashes (they may worsen irritation)
- Sharp or hard foods that can injure the area

## 🚨 Red Flags (See a Dentist/Doctor Immediately)

- Ulcers lasting more than 2 weeks
- Very large or unusually painful ulcers
- Frequent recurrence of ulcers
- Ulcers accompanied by fever or weight loss
- Difficulty eating or swallowing
- Ulcers that are spreading or worsening`,
    author: "Ora AI",
    authorRole: "Dental Health Guide",
    date: "March 28, 2026",
    readTime: "4 min read",
    category: "Oral Conditions",
    image:
      "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
    featured: false,
    tags: ["Ulcers", "Canker Sores", "Oral Health"],
  },
  {
    id: 6,
    title: "Hypodontia",
    excerpt:
      "Hypodontia is a developmental condition where one or more permanent teeth fail to develop. The teeth are naturally missing from birth.",
    content: `Hypodontia is a developmental condition where one or more permanent teeth fail to develop. This means the teeth are naturally missing from birth and do not erupt into the mouth later. It is usually a genetic condition, though it can sometimes be associated with other developmental or medical syndromes.

Hypodontia most commonly affects certain teeth such as wisdom teeth, upper lateral incisors, or second premolars. The severity can vary from missing a single tooth to multiple teeth.

You may notice:

- Gaps between teeth without a history of extraction
- Delayed eruption of permanent teeth
- Small or uneven spacing in the dental arch
- Difficulty in proper biting or alignment in some cases
- Aesthetic concerns affecting smile appearance

## Common Causes

- Genetic inheritance (most common factor)
- Developmental disturbances during tooth formation
- Certain syndromes or medical conditions (in rare cases)
- Evolutionary reduction in tooth number in some populations

Hypodontia is not an active disease, but it can affect chewing function, speech, and appearance depending on severity.

Management depends on the individual case and may include orthodontic or restorative solutions such as spacing management, dental implants, bridges, or prosthetics.

## 🟢 Immediate Advice (Now)

- Maintain excellent oral hygiene around existing teeth
- Monitor spacing and bite changes regularly
- Visit a dentist for a full evaluation and treatment planning
- Follow orthodontic advice if spacing or alignment issues are present

## 🟡 Avoid

- Ignoring missing teeth or gaps
- Delaying dental evaluation, especially in children or teenagers
- Self-adjusting teeth or attempting DIY spacing fixes
- Neglecting regular dental check-ups

## 🚨 Red Flags (See a Dentist Immediately)

- Difficulty chewing or biting properly
- Noticeable bite misalignment
- Speech issues related to spacing
- Increasing gaps affecting the surrounding teeth alignment
- Psychological or functional discomfort due to missing teeth`,
    author: "Ora AI",
    authorRole: "Dental Health Guide",
    date: "March 22, 2026",
    readTime: "4 min read",
    category: "Developmental",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80",
    featured: false,
    tags: ["Hypodontia", "Missing Teeth", "Orthodontics"],
  },
];

export const blogCategories = [
  "All",
  "Decay & Cavities",
  "Gum Health",
  "Cosmetic",
  "Oral Conditions",
  "Developmental",
];
