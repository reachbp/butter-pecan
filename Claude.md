# Claude Instructions

## investigate_before_answering

Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer – give grounded and hallucination-free answers.

## write_tests_after_each_task

After completing each task, write unit tests or integration tests to validate the feature. This ensures code quality and prevents regressions. Tests should:
- Cover the main functionality of the feature
- Test edge cases and error handling
- Be maintainable and well-documented
- Run automatically as part of the development workflow
