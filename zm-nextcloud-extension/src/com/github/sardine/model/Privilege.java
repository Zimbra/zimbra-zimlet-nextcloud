package com.github.sardine.model;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAnyElement;
import javax.xml.bind.annotation.XmlMixed;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import java.util.ArrayList;
import java.util.List;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "content"
})
@XmlRootElement(name = "privilege")
public class Privilege {
    @XmlMixed
    @XmlAnyElement(lax = true)
	private List<Object> content;

	public List<Object> getContent() {
		if (content==null)
			content = new ArrayList<Object>();
		return content;
	}

	public void setContent(List<Object> content) {
		this.content = content;
	}

}
