import type { ReactElement } from 'react'

export type FieldDefinition = {
	order: number
	name: string
	description?: string
} & (
	| { type: 'number' }
	| { type: 'range'; min: number; max: number; step: number }
	| { type: 'select'; items: { name: string; value: number }[] }
	| { type: 'string' }
)

function FieldDefinitionEditor({
	value,
	fieldDefinition,
	setField
}: {
	value: number | string
	fieldDefinition: FieldDefinition
	setField: (value: number | string) => void
}): ReactElement {
	return (
		<div className='flex flex-row justify-between items-center'>
			<div className='flex flex-col'>
				<span
					data-testid={`input-title-${fieldDefinition.name}`}
					className='text-l font-bold'
				>
					{fieldDefinition.name}
				</span>
				{fieldDefinition.description ? (
					<span className='text-sm'>{fieldDefinition.description}</span>
				) : (
					<></>
				)}
			</div>
			<span className='w-2/5 flex-shrink-0'>
				<input
					data-testid={`input-editor-${fieldDefinition.name}`}
					className='rounded w-full'
					type={typeof value === 'number' ? 'number' : 'text'}
					value={value}
					onChange={(event): void => {
						setField(
							typeof value === 'number'
								? Number.parseFloat(event.target.value)
								: event.target.value
						)
					}}
				/>
			</span>
		</div>
	)
}

function EditableItem<T extends object>({
	title,
	item,
	setItem,
	fieldDefinitions,
	ignoreFields,
	deletable,
	controls
}: {
	title: string
	item: T
	deletable: boolean
	ignoreFields?: string[]
	setItem: (value?: Partial<T>) => void
	fieldDefinitions: Record<string, FieldDefinition>
	controls?: ReactElement
}): ReactElement {
	const fieldEditors = Object.keys(item)
		.map((key, index): { element: ReactElement; order: number } => {
			if (ignoreFields?.includes(key)) {
				return {
					element: <span key={key} style={{ display: 'hidden' }} />,
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers
					order: index + 10_000
				}
			}
			const value = (item as unknown as Record<string, number | string>)[key]
			const fieldDefinition = key in fieldDefinitions && fieldDefinitions[key]
			return fieldDefinition
				? {
						element: (
							<FieldDefinitionEditor
								key={key}
								value={value}
								fieldDefinition={fieldDefinition}
								setField={(updated): void =>
									setItem({
										[key]: updated
									} as unknown as Partial<T>)
								}
							/>
						),
						order: fieldDefinition.order
				  }
				: {
						element: (
							<div
								key={key}
								className='flex flex-row justify-between items-center'
							>
								<span
									data-testid={`input-title-${key}`}
									className='text-l font-bold'
								>
									{key}
								</span>
								<span className='w-2/5 flex-shrink-0'>
									<input
										data-testid={`input-editor-${key}`}
										className='rounded w-full'
										type={typeof value === 'number' ? 'number' : 'text'}
										value={value}
										onChange={(event): void => {
											setItem({
												[key]:
													typeof value === 'number'
														? Number.parseFloat(event.target.value)
														: event.target.value
											} as unknown as Partial<T>)
										}}
									/>
								</span>
							</div>
						),
						// eslint-disable-next-line @typescript-eslint/no-magic-numbers
						order: index + 1000
				  }
		})
		.sort((a, b): number => a.order - b.order)
		.map(value => value.element)
	return (
		<div className='flex flex-col gap-2 border-2 rounded p-2 max-h-96 overflow-y-auto'>
			<div className='flex flex-row justify-between items-center'>
				<span
					data-testid='editable-item-title'
					className='text-xl font-bold grow-0'
				>
					{title}
				</span>
				<span className='flex flex-row justify-end gap-2 grow'>
					{controls}
					{deletable ? (
						<button
							type='button'
							className='rounded bg-white hover:bg-gray-200 p-2'
							onClick={(): void => {
								setItem()
							}}
						>
							Delete
						</button>
					) : (
						<></>
					)}
				</span>
			</div>
			{fieldEditors}
		</div>
	)
}
EditableItem.defaultProps = {
	ignoreFields: [],
	controls: <></>
}

export default EditableItem