import path from 'path';
import fs from 'fs';
import { Resume } from '../models/Resume.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';
import { parsePdfResume, extractSkillsFromText } from '../services/pdfService.js';
import { generateResumeSuggestions } from '../services/geminiService.js';
import { config } from '../config/config.js';

// Ensure uploads folder exists outside public directories
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

export async function uploadResumePdf(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided. Please select a valid .pdf resume file to upload.',
      });
    }

    // Extract text and analyze skills
    const parsed = await parsePdfResume(req.file.buffer);

    // Save PDF buffer securely to private upload directory (named by user ID)
    const userId = String(req.user._id || req.user.id);
    const safeFilename = `resume_${userId}_${Date.now()}.pdf`;
    const savePath = path.join(config.uploadDir, safeFilename);

    try {
      fs.writeFileSync(savePath, req.file.buffer);
    } catch (fsErr) {
      console.warn('[Resume] Could not write to disk, keeping memory only:', fsErr.message);
    }

    const resumeData = {
      userId,
      originalFilename: req.file.originalname,
      extractedText: parsed.text,
      skills: parsed.skills,
      experienceSummary: parsed.experienceSummary,
      filePath: savePath,
      fileSize: req.file.size,
      isScannedOrEmpty: parsed.isScannedOrEmpty,
      pageCount: parsed.pageCount,
    };

    let savedResume = null;
    if (isMongoConnected()) {
      savedResume = await Resume.findOneAndUpdate(
        { userId: req.user._id },
        resumeData,
        { upsert: true, new: true }
      );
    } else {
      savedResume = memoryStore.saveResume(resumeData);
    }

    return res.status(200).json({
      success: true,
      message: parsed.message,
      is_scanned: savedResume.isScannedOrEmpty,
      raw_text: savedResume.extractedText,
      edited_text: savedResume.extractedText,
      extracted_skills: savedResume.skills,
      extracted_projects: [],
      extracted_experience: savedResume.experienceSummary ? [savedResume.experienceSummary] : [],
      resume: {
        has_resume: true,
        original_filename: savedResume.originalFilename,
        skills: savedResume.skills,
        experience_summary: savedResume.experienceSummary,
        is_scanned_or_empty: savedResume.isScannedOrEmpty,
        page_count: savedResume.pageCount,
        file_size: savedResume.fileSize,
        extracted_text: savedResume.extractedText,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function pasteResumeText(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume text.',
      });
    }

    const cleanText = text.trim();
    const skills = extractSkillsFromText(cleanText);
    const summary = cleanText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .slice(0, 10)
      .join(' ')
      .slice(0, 300);

    const userId = String(req.user._id || req.user.id);
    const resumeData = {
      userId,
      originalFilename: 'pasted_resume.txt',
      extractedText: cleanText,
      skills,
      experienceSummary: summary,
      fileSize: Buffer.byteLength(cleanText, 'utf8'),
      isScannedOrEmpty: false,
      pageCount: 1,
    };

    let savedResume = null;
    if (isMongoConnected()) {
      savedResume = await Resume.findOneAndUpdate(
        { userId: req.user._id },
        resumeData,
        { upsert: true, new: true }
      );
    } else {
      savedResume = memoryStore.saveResume(resumeData);
    }

    return res.status(200).json({
      success: true,
      message: `Resume text processed successfully. Identified ${skills.length} technical skill(s).`,
      is_scanned: false,
      raw_text: savedResume.extractedText,
      edited_text: savedResume.extractedText,
      extracted_skills: savedResume.skills,
      extracted_projects: [],
      extracted_experience: summary ? [summary] : [],
      resume: {
        has_resume: true,
        original_filename: savedResume.originalFilename,
        skills: savedResume.skills,
        experience_summary: savedResume.experienceSummary,
        is_scanned_or_empty: false,
        page_count: 1,
        file_size: savedResume.fileSize,
        extracted_text: savedResume.extractedText,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getResume(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    let resume = null;

    if (isMongoConnected()) {
      resume = await Resume.findOne({ userId: req.user._id });
    } else {
      resume = memoryStore.findResumeByUserId(userId);
    }

    if (!resume) {
      return res.status(200).json({
        has_resume: false,
        skills: [],
        experience_summary: '',
        extracted_text: '',
        original_filename: '',
      });
    }

    return res.status(200).json({
      has_resume: true,
      original_filename: resume.originalFilename,
      skills: resume.skills || [],
      experience_summary: resume.experienceSummary || '',
      extracted_text: resume.extractedText || '',
      is_scanned_or_empty: resume.isScannedOrEmpty || false,
      page_count: resume.pageCount || 1,
      file_size: resume.fileSize || 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateResume(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { edited_text, extracted_skills, skills, experience_summary } = req.body;
    const finalSkills = extracted_skills || skills || [];
    const text = edited_text !== undefined ? edited_text : '';

    const resumeData = {
      userId,
      originalFilename: 'custom_resume.txt',
      extractedText: text,
      skills: finalSkills,
      experienceSummary: experience_summary || text.slice(0, 300),
      fileSize: Buffer.byteLength(text, 'utf8'),
      isScannedOrEmpty: false,
      pageCount: 1,
    };

    let savedResume = null;
    if (isMongoConnected()) {
      savedResume = await Resume.findOneAndUpdate(
        { userId: req.user._id },
        resumeData,
        { upsert: true, new: true }
      );
    } else {
      savedResume = memoryStore.saveResume(resumeData);
    }

    return res.status(200).json({
      success: true,
      message: 'Resume updated successfully.',
      has_resume: true,
      raw_text: savedResume.extractedText,
      edited_text: savedResume.extractedText,
      extracted_skills: savedResume.skills,
      extracted_projects: [],
      extracted_experience: [],
      resume: {
        has_resume: true,
        original_filename: savedResume.originalFilename,
        skills: savedResume.skills,
        experience_summary: savedResume.experienceSummary,
        extracted_text: savedResume.extractedText,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);

    if (isMongoConnected()) {
      await Resume.findOneAndDelete({ userId: req.user._id });
    } else {
      memoryStore.deleteResumeByUserId(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function getResumeSuggestions(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const { target_role, has_consent } = req.body;

    if (!has_consent) {
      return res.status(400).json({
        success: false,
        message: 'Explicit user consent is required before sending resume text to the AI suggestions service.',
      });
    }

    let resume = null;
    if (isMongoConnected()) {
      resume = await Resume.findOne({ userId: req.user._id });
    } else {
      resume = memoryStore.findResumeByUserId(userId);
    }

    if (!resume || !resume.extractedText || resume.extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No resume found. Please upload a PDF resume or paste resume text first.',
      });
    }

    const suggestions = await generateResumeSuggestions({
      resumeText: resume.extractedText,
      targetRole: target_role || 'Software Engineer',
      hasConsent: true,
    });

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (err) {
    next(err);
  }
}


