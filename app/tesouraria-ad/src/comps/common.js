import React from 'react';
import NumberFormat from 'react-number-format';
import fire from './fire';

function BRLFormat(props) {
	const { inputRef, onChange, ...other } = props;

	return (
		<NumberFormat
			{...other}
			ref={inputRef}
			onValueChange={(values) => {
				onChange({
					target: {
						value: values.value,
					},
				});
			}}
			decimalSeparator={","}
			thousandSeparator={false}
			prefix={"R$"}
			decimalScale={2}
			fixedDecimalScale={true}
			isNumericString={true} />
	);
}

export { BRLFormat }