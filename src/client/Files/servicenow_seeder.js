
/**
 * EDUPULSE AI - AUTO-SCHEMA & DATA SEEDER
 * 
 * 1. CHECKS if tables exist -> Creates them if missing.
 * 2. CHECKS if columns exist -> Creates them if missing.
 * 3. SEEDS demo data linked to the current user.
 * 
 * RUN THIS IN: System Definition > Scripts - Background
 */

(function runFullSetup() {

    gs.info(">>> EduPulse Setup: Initializing...");

    // ======================================================
    // PART 1: SCHEMA DEFINITION
    // ======================================================
    
    // Define tables in dependency order (Parents first)
    var schemaDefs = [
        {
            table: 'u_edu_course', label: 'Edu Course',
            columns: [
                { name: 'u_title', label: 'Title', type: 'string', len: 100, display: true },
                { name: 'u_instructor', label: 'Instructor', type: 'string', len: 100 },
                { name: 'u_total_modules', label: 'Total Modules', type: 'integer' },
                { name: 'u_thumbnail_url', label: 'Thumbnail URL', type: 'string', len: 1000 },
                { name: 'u_category', label: 'Category', type: 'string', len: 40 },
                { name: 'u_description', label: 'Description', type: 'string', len: 4000 },
                { name: 'u_recommended', label: 'Recommended', type: 'boolean' },
                { name: 'u_skills', label: 'Skills', type: 'string', len: 255 },
                { name: 'u_rating', label: 'Rating', type: 'decimal' }
            ]
        },
        {
            table: 'u_edu_student_profile', label: 'Edu Student Profile',
            columns: [
                { name: 'u_student_email', label: 'Student Email', type: 'string', len: 100, display: true },
                { name: 'u_gpa', label: 'GPA', type: 'decimal' },
                { name: 'u_attendance_score', label: 'Attendance Score', type: 'integer' },
                { name: 'u_strongest_skill', label: 'Strongest Skill', type: 'string', len: 100 },
                { name: 'u_weakest_skill', label: 'Weakest Skill', type: 'string', len: 100 }
            ]
        },
        {
            table: 'u_edu_enrollment', label: 'Edu Enrollment',
            columns: [
                { name: 'u_student_email', label: 'Student Email', type: 'string', len: 100 },
                { name: 'u_course', label: 'Course', type: 'reference', ref: 'u_edu_course' },
                { name: 'u_progress', label: 'Progress', type: 'integer' },
                { name: 'u_completed_modules', label: 'Completed Modules', type: 'integer' },
                { name: 'u_active', label: 'Active', type: 'boolean' }
            ]
        },
        {
            table: 'u_edu_assessment', label: 'Edu Assessment',
            columns: [
                { name: 'u_title', label: 'Title', type: 'string', len: 100, display: true },
                { name: 'u_course', label: 'Course', type: 'reference', ref: 'u_edu_course' },
                { name: 'u_due_date', label: 'Due Date', type: 'glide_date' },
                { name: 'u_total_points', label: 'Total Points', type: 'integer' },
                { name: 'u_avg_score', label: 'Avg Score', type: 'integer' },
                { name: 'u_status', label: 'Status', type: 'string', len: 40 }, // Choice simplified to string
                { name: 'u_type', label: 'Type', type: 'string', len: 40 }
            ]
        },
        {
            table: 'u_edu_submission', label: 'Edu Submission',
            columns: [
                { name: 'u_student_email', label: 'Student Email', type: 'string', len: 100 },
                { name: 'u_assessment', label: 'Assessment', type: 'reference', ref: 'u_edu_assessment' },
                { name: 'u_submitted_at', label: 'Submitted At', type: 'glide_date_time' },
                { name: 'u_status', label: 'Status', type: 'string', len: 40 },
                { name: 'u_score', label: 'Score', type: 'integer' },
                { name: 'u_feedback', label: 'Feedback', type: 'string', len: 4000 },
                { name: 'u_attachment_name', label: 'Attachment Name', type: 'string', len: 255 }
            ]
        },
        {
            table: 'u_edu_event', label: 'Edu Event',
            columns: [
                { name: 'u_title', label: 'Title', type: 'string', len: 100 },
                { name: 'u_date', label: 'Date', type: 'glide_date' },
                { name: 'u_type', label: 'Type', type: 'string', len: 40 },
                { name: 'u_student_email', label: 'Student Email', type: 'string', len: 100 },
                { name: 'u_course', label: 'Course', type: 'reference', ref: 'u_edu_course' },
                { name: 'u_description', label: 'Description', type: 'string', len: 500 }
            ]
        },
        {
            table: 'u_edu_nudge', label: 'Edu Nudge',
            columns: [
                { name: 'u_student_email', label: 'Student Email', type: 'string', len: 100 },
                { name: 'u_type', label: 'Type', type: 'string', len: 40 },
                { name: 'u_severity', label: 'Severity', type: 'string', len: 20 },
                { name: 'u_message', label: 'Message', type: 'string', len: 255 },
                { name: 'u_action_label', label: 'Action Label', type: 'string', len: 40 },
                { name: 'u_details', label: 'Details', type: 'string', len: 1000 },
                { name: 'u_active', label: 'Active', type: 'boolean' }
            ]
        },
        {
            table: 'u_edu_compliance', label: 'Edu Compliance',
            columns: [
                { name: 'u_student', label: 'Student', type: 'string', len: 100 },
                { name: 'u_score', label: 'Score', type: 'integer' },
                { name: 'u_compliant', label: 'Compliant', type: 'boolean' },
                { name: 'u_observations', label: 'Observations', type: 'string', len: 4000 },
                { name: 'u_recommendations', label: 'Recommendations', type: 'string', len: 4000 }
            ]
        },
        {
            table: 'u_edu_exam_review', label: 'Edu Exam Review',
            columns: [
                { name: 'u_student', label: 'Student', type: 'string', len: 100 },
                { name: 'u_subject', label: 'Subject', type: 'string', len: 100 },
                { name: 'u_grade', label: 'Grade', type: 'integer' },
                { name: 'u_transcription', label: 'Transcription', type: 'string', len: 4000 },
                { name: 'u_feedback', label: 'Feedback', type: 'string', len: 4000 }
            ]
        }
    ];

    // ======================================================
    // PART 2: SCHEMA CREATION HELPERS
    // ======================================================

    function ensureTable(tableName, label) {
        var db = new GlideRecord('sys_db_object');
        db.addQuery('name', tableName);
        db.query();
        if (!db.next()) {
            db.initialize();
            db.name = tableName;
            db.label = label;
            db.sys_scope = 'global'; 
            db.insert();
            gs.info('++ Created Table: ' + tableName);
            return true;
        }
        return false;
    }

    function ensureColumn(tableName, colDef) {
        var dict = new GlideRecord('sys_dictionary');
        dict.addQuery('name', tableName);
        dict.addQuery('element', colDef.name);
        dict.query();
        if (!dict.next()) {
            dict.initialize();
            dict.name = tableName;
            dict.element = colDef.name;
            dict.column_label = colDef.label;
            dict.internal_type = colDef.type;
            if (colDef.len) dict.max_length = colDef.len;
            if (colDef.ref) dict.reference = colDef.ref;
            if (colDef.display) dict.display = true;
            dict.active = true;
            dict.insert();
            gs.info('-- Created Column: ' + colDef.name + ' on ' + tableName);
            return true;
        }
        return false;
    }

    // Run Schema Creation
    var schemaChanges = false;
    for (var i = 0; i < schemaDefs.length; i++) {
        var def = schemaDefs[i];
        if (ensureTable(def.table, def.label)) schemaChanges = true;
        for (var j = 0; j < def.columns.length; j++) {
            if (ensureColumn(def.table, def.columns[j])) schemaChanges = true;
        }
    }

    if (schemaChanges) {
        gs.info(">>> Schema changes detected. If the script fails below, wait 30 seconds for DB commit and run again.");
    }

    // ======================================================
    // PART 3: DATA SEEDING
    // ======================================================

    var studentEmail = 'admin@example.com'; 
    var userGR = new GlideRecord('sys_user');
    if (userGR.get(gs.getUserID())) {
        studentEmail = userGR.getValue('email') || studentEmail;
    }

    function createOrUpdate(table, queryObj, dataObj) {
        // Safe check if table exists (in case schema creation just happened but isnt visible yet to GlideRecord)
        try {
            var dummy = new GlideRecord(table);
            if (!dummy.isValid()) {
                gs.error("SKIPPING SEED: Table " + table + " not valid yet. Run script again.");
                return null;
            }
        } catch(e) { return null; }

        var gr = new GlideRecord(table);
        for (var key in queryObj) {
            gr.addQuery(key, queryObj[key]);
        }
        gr.query();
        
        if (gr.next()) {
            for (var field in dataObj) {
                gr.setValue(field, dataObj[field]);
            }
            gr.update();
            return gr.getUniqueValue();
        } else {
            gr.initialize();
            for (var k in queryObj) gr.setValue(k, queryObj[k]);
            for (var f in dataObj) gr.setValue(f, dataObj[f]);
            return gr.insert();
        }
    }

    // --- SEED COURSES ---
    var courseIds = {};
    var courses = [
        {
            u_title: 'Advanced Data Structures',
            u_instructor: 'Dr. Sarah Chen',
            u_total_modules: 12,
            u_category: 'Computer Science',
            u_thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
            u_description: 'Master trees, graphs, and hash tables with advanced algorithmic analysis.',
            u_recommended: true,
            u_rating: 4.9,
            u_skills: 'Algorithms, C++, Graph Theory'
        },
        {
            u_title: 'UX/UI Design Systems',
            u_instructor: 'Prof. Marcus O',
            u_total_modules: 8,
            u_category: 'Design',
            u_thumbnail_url: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&q=80',
            u_description: 'Learn to build scalable design systems and manage component libraries.',
            u_recommended: true,
            u_rating: 4.7,
            u_skills: 'Figma, Design Tokens, Prototyping'
        },
        {
            u_title: 'Modern React Patterns',
            u_instructor: 'Dan A.',
            u_total_modules: 10,
            u_category: 'Computer Science',
            u_thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
            u_description: 'A comprehensive guide to modern React development, including Hooks and Context.',
            u_recommended: true,
            u_rating: 4.9,
            u_skills: 'React, TypeScript, State Management'
        },
        {
            u_title: 'AI Ethics & Compliance',
            u_instructor: 'Dr. A. Turing',
            u_total_modules: 5,
            u_category: 'Humanities',
            u_thumbnail_url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&q=80',
            u_description: 'Explore the moral implications of Artificial Intelligence.',
            u_recommended: false,
            u_rating: 4.5,
            u_skills: 'Ethics, Policy, Regulatory'
        }
    ];

    courses.forEach(function(c) {
        var sysId = createOrUpdate('u_edu_course', { u_title: c.u_title }, c);
        if (sysId) courseIds[c.u_title] = sysId;
    });

    // --- SEED PROFILE ---
    createOrUpdate('u_edu_student_profile', { u_student_email: studentEmail }, {
        u_gpa: 3.8,
        u_attendance_score: 92,
        u_strongest_skill: 'React Development',
        u_weakest_skill: 'Database Optimization'
    });

    // --- SEED ENROLLMENTS ---
    var enrolledTitles = ['Advanced Data Structures', 'Modern React Patterns'];
    enrolledTitles.forEach(function(title) {
        if (!courseIds[title]) return;
        createOrUpdate('u_edu_enrollment', { 
            u_student_email: studentEmail, 
            u_course: courseIds[title] 
        }, {
            u_progress: Math.floor(Math.random() * 50) + 20,
            u_completed_modules: 3,
            u_active: true
        });
    });

    // --- SEED ASSESSMENTS ---
    var assessmentIds = {};
    if (courseIds['Advanced Data Structures']) {
        var d = new GlideDate(); d.addDaysUTC(5);
        var aid = createOrUpdate('u_edu_assessment', { u_title: 'Midterm Algorithm Analysis' }, {
            u_course: courseIds['Advanced Data Structures'],
            u_total_points: 100,
            u_due_date: d,
            u_status: 'Published',
            u_type: 'Quiz',
            u_avg_score: 78
        });
        if(aid) assessmentIds['DS_Midterm'] = aid;
    }

    if (courseIds['UX/UI Design Systems']) {
        var d3 = new GlideDate(); d3.addDaysUTC(-2);
        var aid3 = createOrUpdate('u_edu_assessment', { u_title: 'Figma Component Systems' }, {
            u_course: courseIds['UX/UI Design Systems'],
            u_total_points: 20,
            u_due_date: d3,
            u_status: 'Graded',
            u_type: 'Quiz',
            u_avg_score: 88
        });
        if(aid3) assessmentIds['UX_Quiz'] = aid3;
    }

    // --- SEED SUBMISSIONS ---
    if (assessmentIds['UX_Quiz']) {
        createOrUpdate('u_edu_submission', { 
            u_student_email: studentEmail, 
            u_assessment: assessmentIds['UX_Quiz'] 
        }, {
            u_submitted_at: new GlideDateTime(),
            u_status: 'Graded',
            u_score: 18,
            u_feedback: 'Excellent use of auto-layout components. Great job.',
            u_attachment_name: 'figma_export.pdf'
        });
    }

    // --- SEED EVENTS ---
    var tomorrow = new GlideDate(); tomorrow.addDaysUTC(1);
    createOrUpdate('u_edu_event', { u_title: 'Group Study: Graph Theory' }, {
        u_date: tomorrow,
        u_type: 'study',
        u_student_email: studentEmail,
        u_description: 'Library Room 304 with study group A.',
        u_course: courseIds['Advanced Data Structures'] || ''
    });

    // --- SEED NUDGES ---
    createOrUpdate('u_edu_nudge', { u_message: 'Attendance Alert: You missed the last 2 labs.' }, {
        u_type: 'Risk',
        u_severity: 'medium',
        u_student_email: studentEmail,
        u_details: 'Falling below 85% attendance puts you at risk for the final grade curve.',
        u_active: true,
        u_action_label: 'Contact Tutor'
    });

    // --- SEED COMPLIANCE ---
    createOrUpdate('u_edu_compliance', { u_observations: 'Initial System Check' }, {
        u_student: studentEmail,
        u_score: 85,
        u_compliant: true,
        u_observations: 'Lighting is adequate. Ergonomic chair detected.',
        u_recommendations: 'Consider a monitor stand to reduce neck strain.'
    });

    gs.info(">>> EduPulse Master Seeder: COMPLETE");
})();
