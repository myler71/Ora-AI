# Ora AI Restore Points Index

## Restore Points Available

1. **`AI_PROJECT_RESTORE_BEFORE_AI`** (Latest Snapshot)
   - Created before major deep AI integration overhaul.
   - Location: `C:\Users\Myler\Downloads\Compressed\Mohamed_Ibrahim_Amin\Mohamed_Ibrahim_Amin_21511760\AI_PROJECT_RESTORE_BEFORE_AI`
   - Contains: Complete 10-patient populated dataset, all 6 clinical pages, FDI Anatomical Odontogram (gold crown, black dot filling), interactive calendar, and PDF attachment uploader.

2. **`AI_PROJECT_RESTORE_V1`** (Baseline Snapshot)
   - Created after initial 8-goal completion.
   - Location: `C:\Users\Myler\Downloads\Compressed\Mohamed_Ibrahim_Amin\Mohamed_Ibrahim_Amin_21511760\AI_PROJECT_RESTORE_V1`

### Restore Command
```bash
robocopy "C:\Users\Myler\Downloads\Compressed\Mohamed_Ibrahim_Amin\Mohamed_Ibrahim_Amin_21511760\AI_PROJECT_RESTORE_BEFORE_AI" "C:\Users\Myler\Downloads\Compressed\Mohamed_Ibrahim_Amin\Mohamed_Ibrahim_Amin_21511760\AI_PROJECT" /E /XD node_modules dist .git __pycache__ venv
```
