    import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import { APP_ARTICLE_MAX_WIDTH_CLASS, createPageUrl } from '@/utils';
    import { ArrowLeft, Bookmark } from 'lucide-react';
    import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
    import {
        listSavedResources,
        createSavedResource,
        deleteSavedResource,
    } from '@/api/savedResourceApi';
    import { getUserId } from '@/lib/auth';
    import { useDocumentTitle } from '@/hooks/useDocumentTitle';

    const articleContent = {
    tip1: {
        title: 'Understanding Baby Sleep',
        category: 'sleep',
        content: `Newborn sleep can feel unpredictable, but understanding sleep patterns helps set realistic expectations.

    **What to Expect:**
    - Newborns sleep 14-17 hours per day in short bursts
    - Sleep cycles are 45-60 minutes long
    - Day/night confusion is normal for the first 6-8 weeks

    **Creating a Sleep-Friendly Environment:**
    - Keep the room dark and quiet during nighttime feeds
    - Use white noise to help baby settle
    - Swaddle safely for comfort and security

    **Remember:**
    Every baby is different. What works for one may not work for another. Trust your instincts and give yourself grace as you learn your baby's unique patterns.`,
    },
    tip2: {
        title: 'Postpartum Recovery',
        category: 'recovery',
        content: `Your body has just done something incredible. Recovery takes time, patience, and self-compassion.

    **Physical Healing:**
    - Rest as much as possible in the first 2 weeks
    - Stay hydrated and eat nourishing foods
    - Accept help with household tasks
    - Gentle movement when cleared by your provider

    **Emotional Adjustment:**
    - Mood swings are normal due to hormone shifts
    - Baby blues affect up to 80% of new parents
    - Reach out if sadness persists beyond 2 weeks

    **Self-Care Essentials:**
    - Comfortable, loose clothing
    - Warm sitz baths for perineal healing
    - Support for breastfeeding if needed
    - Connection with other new parents

    You're healing, adjusting, and learning. Be patient with yourself.`,
    },
    tip3: {
        title: 'Quick Self-Care Ideas',
        category: 'mindfulness',
        content: `Self-care doesn't have to be elaborate. Small moments matter.

    **5-Minute Self-Care:**
    - Deep breathing while baby sleeps
    - Favorite song with eyes closed
    - Warm tea in silence
    - Gentle stretching
    - Face wash and moisturizer

    **During Feeding:**
    - Listen to a podcast or audiobook
    - Practice gratitude
    - Notice your baby's features
    - Gentle shoulder rolls

    **With Support:**
    - 10-minute shower
    - Quick walk around the block
    - Call a friend
    - Eat a warm meal

    The goal isn't perfection—it's presence. Even 5 minutes of intentional care makes a difference.`,
    },
    tip4: {
        title: 'Partner Communication',
        category: 'partner',
        content: `Asking for what you need is a skill that strengthens relationships.

    **Be Specific:**
    Instead of "I need help," try "Can you hold the baby while I shower?"

    **Use "I" Statements:**
    "I feel overwhelmed when..." rather than "You never..."

    **Schedule Check-Ins:**
    - Weekly 10-minute conversations
    - Share what's working and what's hard
    - Express appreciation

    **Common Needs to Communicate:**
    - Sleep arrangements
    - Division of baby tasks
    - Emotional support needs
    - Time for yourself

    **Remember:**
    Your partner wants to help but may not know how. Clear, kind communication benefits everyone.`,
    },
    tip5: {
        title: 'Breastfeeding Basics',
        category: 'breastfeeding',
        content: `Breastfeeding is natural, but it's also a learned skill for both you and baby.

    **Getting Started:**
    - Skin-to-skin contact helps
    - Feed on demand in early weeks
    - Watch for hunger cues, not the clock
    - Proper latch prevents pain

    **Common Challenges:**
    - Engorgement: Frequent feeding and cold compresses
    - Sore nipples: Check latch, use lanolin
    - Low supply concerns: Often perception, not reality

    **Support Resources:**
    - Lactation consultant
    - Support groups
    - Your pediatrician
    - Trusted online communities

    **Remember:**
    Fed is best. Whether you breastfeed, formula feed, or do both—you're nourishing your baby perfectly.`,
    },
    tip6: {
        title: 'Managing Overwhelm',
        category: 'mental_health',
        content: `Feeling overwhelmed is not a sign of weakness. It's a sign you're human.

    **In the Moment:**
    - Take 3 deep breaths
    - Put baby in a safe space
    - Step away for 60 seconds
    - Call someone you trust

    **Daily Practices:**
    - Lower your standards
    - Do one thing at a time
    - Say no to non-essentials
    - Accept imperfection

    **Signs You Need More Support:**
    - Persistent sadness
    - Difficulty bonding with baby
    - Scary or intrusive thoughts
    - Inability to sleep even when baby sleeps

    **Reach Out:**
    Postpartum depression and anxiety are treatable. You deserve support. There is no shame in asking for help.`,
    },
    tip7: {
        title: 'Building Your Village',
        category: 'partner_support',
        content: `You don't have to do this alone. Building a support system is essential.

    **Types of Support:**
    - Practical: Meals, cleaning, errands
    - Emotional: Listening, validating, encouraging
    - Informational: Advice from those who've been there
    - Professional: Therapists, lactation consultants, doulas

    **Finding Your People:**
    - Local parent groups
    - Online communities
    - Neighbors and family
    - Parent-baby classes
    - Postpartum support groups

    **Accepting Help:**
    - Be specific about what you need
    - Let go of perfection
    - Say yes when offered
    - Create a meal train or help calendar

    **Remember:**
    Strong people ask for help. Building your village is an act of strength, not weakness.`,
    },
    tip8: {
        title: 'Sleep When Baby Sleeps',
        category: 'sleep',
        content: `This advice sounds simple, but actually doing it requires intention.

    **Why It Matters:**
    - Sleep deprivation affects mood, milk supply, and recovery
    - Even 20-minute naps help
    - Rest is productive

    **Making It Happen:**
    - Lower household standards
    - Let dishes wait
    - Turn off phone notifications
    - Create a dark, cool environment
    - Don't "just check" social media

    **When You Can't Sleep:**
    - Rest with eyes closed still helps
    - Gentle meditation or breathing
    - Listen to calming music
    - Avoid screens

    **Permission Slip:**
    You have permission to rest. The laundry can wait. Your healing cannot.`,
    },
    tip9: {
        title: 'First Foods Guide',
        category: 'feeding',
        content: `Starting solids is an exciting milestone. Here's what you need to know.

    **When to Start:**
    - Around 6 months
    - When baby can sit with support
    - Shows interest in food
    - Has lost tongue-thrust reflex

    **First Foods:**
    - Iron-fortified cereals
    - Pureed vegetables and fruits
    - Mashed avocado
    - Soft proteins (after 6 months)

    **Safety Tips:**
    - Always supervise eating
    - Introduce one food at a time
    - Watch for allergies
    - Avoid honey before 12 months
    - Cut foods appropriately

    **Remember:**
    Food before one is mostly for fun. Breast milk or formula is still primary nutrition.`,
    },
    tip10: {
        title: 'Baby Development Milestones',
        category: 'development',
        content: `Babies develop at their own pace. These are general guidelines, not rules.

    **0-3 Months:**
    - Focuses on faces
    - Smiles socially
    - Coos and makes sounds
    - Lifts head during tummy time

    **4-6 Months:**
    - Rolls over
    - Reaches for objects
    - Laughs
    - Sits with support

    **7-9 Months:**
    - Sits without support
    - Crawls or scoots
    - Transfers objects hand to hand
    - Responds to name

    **10-12 Months:**
    - Pulls to stand
    - Says first words
    - Points
    - May take first steps

    **Remember:**
    Every baby is unique. If you have concerns, talk to your pediatrician. Comparison steals joy.`,
    },
    tip11: {
        title: 'Mindful Parenting',
        category: 'mindfulness',
        content: `Staying present during the early days helps you survive and thrive.

    **What It Means:**
    - Noticing without judgment
    - Being here, not planning ahead
    - Accepting what is
    - Responding instead of reacting

    **Daily Practices:**
    - Notice 5 things you can see, hear, feel
    - Pause before responding to crying
    - Savor one moment fully each day
    - Release perfectionism

    **During Hard Moments:**
    - Name the emotion: "I'm feeling frustrated"
    - Take 3 breaths
    - Remember: This is temporary
    - Choose your response

    **Benefits:**
    - Reduced stress
    - Deeper connection with baby
    - More joy in ordinary moments
    - Greater self-compassion

    You don't have to be perfect. You just have to be present.`,
    },
    tip12: {
        title: 'Supporting Your Mental Health',
        category: 'mental_health',
        content: `Your mental health matters. Taking care of yourself helps you care for your baby.

    **Know the Signs:**
    Postpartum depression and anxiety can include:
    - Persistent sadness or hopelessness
    - Excessive worry
    - Difficulty bonding with baby
    - Scary thoughts
    - Changes in appetite or sleep beyond normal

    **What Helps:**
    - Talk to your provider
    - Therapy (especially for postpartum)
    - Medication when needed
    - Support groups
    - Rest and nutrition
    - Movement
    - Connection with others

    **When to Seek Help:**
    If symptoms persist beyond 2 weeks or interfere with daily life, reach out immediately. You deserve support.

    **Remember:**
    - 1 in 7 experience postpartum depression
    - 1 in 10 experience postpartum anxiety
    - Treatment is effective
    - You are not alone
    - This is not your fault
    - You will feel better

    **Resources:**
    - Postpartum Support International: 1-800-944-4773
    - Your OB/GYN or midwife
    - Your pediatrician
    - Local support groups
    - Crisis Text Line: Text HOME to 741741

    You deserve to feel well. Please reach out.`,
    },
    };

    export default function ArticleView() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    const fromTab = params.get('from');
    
    const article = articleContent[articleId];
    useDocumentTitle(article?.title ?? 'Article');
    const uid = getUserId();

    const { data: savedResources = [] } = useQuery({
        queryKey: ['savedTips', uid],
        queryFn: () =>
            listSavedResources({
                filter: { user_id: uid },
                limit: 200,
            }),
        enabled: Boolean(uid),
    });

    const isSaved = savedResources.some(
        r => r.resource_id === articleId && r.resource_type === 'tip'
    );

    const toggleSaveMutation = useMutation({
        mutationFn: async () => {
        if (!uid) return;
        const existing = savedResources.find(
            r => r.resource_id === articleId && r.resource_type === 'tip'
        );

        if (existing) {
            const sid = existing.saved_resource_id ?? existing.SavedResourceId ?? existing.id;
            await deleteSavedResource(sid);
        } else {
            await createSavedResource({
            resource_id: articleId,
            resource_type: 'tip',
            user_id: uid,
            });
        }
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['savedTips', uid] });
        },
    });

    if (!article) {
        return (
        <div className="min-h-screen bg-[#FEF9F5] p-6 flex items-center justify-center">
            <p className="text-[#7D7589]">Article not found</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FEF9F5] pb-24">
        <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-[#E8E4F3]/50 p-4 z-10">
            <div className={`${APP_ARTICLE_MAX_WIDTH_CLASS} flex justify-between items-center`}>
            <button
                type="button"
                onClick={() => {
                if (fromTab === 'home') {
                    navigate(createPageUrl('Home'));
                } else {
                    navigate(createPageUrl('Resources') + (fromTab ? `?tab=${fromTab}` : ''));
                }
                }}
                className="p-2 rounded-xl hover:bg-[#F5EEF8] transition-colors"
                aria-label="Back to previous screen"
            >
                <ArrowLeft className="w-5 h-5 text-[#4A4458]" aria-hidden />
            </button>
            
            <button
                type="button"
                onClick={() => toggleSaveMutation.mutate()}
                className="p-2 rounded-xl hover:bg-[#F5EEF8] transition-colors"
                aria-label={isSaved ? 'Remove article from saved' : 'Save article'}
            >
                <Bookmark
                className={`w-5 h-5 ${isSaved ? 'text-[#8B7A9F]' : 'text-[#8B7A9F]/30'}`}
                fill={isSaved ? 'currentColor' : 'none'}
                aria-hidden
                />
            </button>
            </div>
        </div>

        <div className={`${APP_ARTICLE_MAX_WIDTH_CLASS} px-4 py-8`}>
            <div className="mb-4">
            <span className="text-xs font-medium text-[#8B7A9F] uppercase tracking-wide bg-[#F5EEF8] px-3 py-1 rounded-full">
                {article.category}
            </span>
            </div>

            <h1 className="text-3xl font-bold text-[#4A4458] mb-6">
            {article.title}
            </h1>

            <div className="prose prose-sm max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                    <h2 key={index} className="text-xl font-semibold text-[#4A4458] mt-6 mb-3">
                    {paragraph.replace(/\*\*/g, '')}
                    </h2>
                );
                } else if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                    <ul key={index} className="list-disc pl-5 space-y-2 text-[#4A4458] mb-4">
                    {items.map((item, i) => (
                        <li key={i}>{item.replace('- ', '')}</li>
                    ))}
                    </ul>
                );
                } else {
                return (
                    <p key={index} className="text-[#4A4458] leading-relaxed mb-4">
                    {paragraph}
                    </p>
                );
                }
            })}
            </div>
        </div>
        </div>
    );
    }